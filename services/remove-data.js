const models = require("../models");
const config = require("../config/config");

const { logger } = require("../logger");
const { globalInflux } = require("../common/influx-init");

// Importing Models
const Stations = models.Station;
const Trolleys = models.Trolley;
const Barcodes = models.Barcode;

/**
 * Deletes the trolley from SQL and Influx database
 * @param {number} trolleyId - the trolleyId that you want to delete
 */
const removeTrolley = async (trolleyId) => {
  // Now that we have deleted this trolley, we need to remove this from
  // Stations data too
  const currentTrolley = await Trolleys.findOne({
    where: { trolleyId },
  });

  // We first try to delete from activeStations
  const activeStation = await Stations.findOne({
    where: { stationId: currentTrolley.stationId },
  });

  if (activeStation) {
    const removedTrolleyIds = activeStation.trolleyIds.filter((trolleyId) => {
      return trolleyId !== currentTrolley.trolleyId;
    });

    activeStation.set({ trolleyIds: removedTrolleyIds });
    await activeStation.save();
  }

  // Then we try to delete from exitStations
  const exitStation = await Stations.findOne({
    where: { stationId: currentTrolley.lastStationId },
  });

  if (exitStation) {
    const removedTrolleyIds = exitStation.exitTrolleyIds.filter((trolleyId) => {
      return trolleyId !== currentTrolley.trolleyId;
    });

    exitStation.set({ exitTrolleyIds: removedTrolleyIds });
    await exitStation.save();
  }

  // Finally we delete the trolley
  await Trolleys.destroy({
    where: { trolleyId },
  });
};

/**
 * Remove barcode from influxDB
 * @param {string} barcode - barcode to remove
 * @returns true if deleted - false otherwise
 */
const removeBarcodeFromInflux = async (barcode) => {
  try {
    return await globalInflux.db.deleteData({
      bucket: config.influx.name,
      measurement: "factory_floor",
      start: "2009-01-02T23:00:00Z",
      stop: new Date(),
      tagsCondition: `barcode="${barcode}"`,
    });
  } catch (error) {
    logger.error("Could not delete barcode from Influx:");
    logger.error(barcode);
    logger.error(error);
  }
};

const removeOverloadFromInflux = async (stationId) => {
  try {
    return await globalInflux.db.deleteData({
      bucket: config.influx.name,
      measurement: "station_overload",
      start: "2009-01-02T23:00:00Z",
      stop: new Date(),
      tagsCondition: `stationId="${stationId}"`,
    });
  } catch (error) {
    logger.error("Could not delete barcode from Influx:");
    logger.error(stationId);
    logger.error(error);
  }
};

/**
 * Remove barcode from influxDB
 * @returns true if deleted - false otherwise
 */
const removeAllBarcodesFromInflux = async () => {
  try {
    return await globalInflux.db.deleteData({
      bucket: config.influx.name,
      measurement: "factory_floor",
      start: "2009-01-02T23:00:00Z",
      stop: new Date(),
    });
  } catch (error) {
    logger.error("Could not delete barcode from Influx");
    logger.error(error);
  }
};

/**
 * Removes all barcodes and trolleys
 * @returns nothing
 */
exports.deleteAllData = async () => {
  const allBarcodes = await Barcodes.findAll();
  const allTrollies = await Trolleys.findAll();
  const allStations = await Stations.findAll();

  // Deleting from Influx
  await removeAllBarcodesFromInflux();

  // Deleting from MySQL
  await Promise.all(
    allBarcodes.map(async (obj) => {
      try {
        // Deleting from MySQL
        await Barcodes.destroy({
          where: { barcode: obj.barcode },
        });

        return true;
      } catch (err) {
        logger.error(err);
        return false;
      }
    }),
  );

  logger.info("Deleted All Barcodes");

  // Now we delete all the trollies
  // And their data from their stations
  await Promise.all(
    allTrollies.map(async (trolley) => {
      try {
        await removeTrolley(trolley.trolleyId);
      } catch (error) {
        logger.error(error);
      }
    }),
  );

  logger.info("Deleted All Trollies");

  // Finally we clear all stations to ensure that there
  // is no trolley in the pending or going state
  await Promise.all(
    allStations.map(async (station) => {
      station.set({ trolleyIds: [] });
      station.set({ exitTrolleyIds: [] });
      station.save();
    }),
  );

  logger.info("Updated All Stations");

  return true;
};

/**
 * Removes all unused barcodes and trolleys
 * @returns nothing
 */
exports.deleteInActiveData = async () => {
  const allStations = await Stations.findAll();
  const allBarcodes = await Barcodes.findAll();
  const allTrollies = await Trolleys.findAll();

  // Iterating over all the stations to find active trolleys
  const activeTrolleyIds = [];
  allStations.forEach((element) => {
    if (!element.trolleyIds || !element.exitTrolleyIds) {
      return;
    }
    activeTrolleyIds.push(...element.trolleyIds.concat(element.exitTrolleyIds));
  });

  // We find barcodes that are not currently associated with a trolley to delete them
  const barcodesToDelete = allBarcodes.filter((barcode) => {
    return activeTrolleyIds.indexOf(barcode.trolleyId) === -1;
  });

  // allBarcodes = allBarcodes.filter((barcode) => {
  //   if (barcode.trolleyId === trolleyIdToDelete) {
  //     return true;
  //   }

  //   const journey = barcode.journey;
  //   return (
  //     journey.findIndex((state) => {
  //       return state.trolleyId === trolleyIdToDelete;
  //     }) !== -1
  //   );
  // });

  await Promise.all(
    barcodesToDelete.map(async (obj) => {
      // First try to delete the barcode from the InfluxDB database
      try {
        await removeBarcodeFromInflux(obj.barcode);

        await Barcodes.destroy({
          where: { barcode: obj.barcode },
        });

        // Only delete the trolley associated with the barcode if it is not currently active
        if (obj.trolleyId) {
          await Trolleys.destroy({
            where: { trolleyId: obj.trolleyId },
          });
        }

        return true;
      } catch (err) {
        logger.error(err);
        return false;
      }
    }),
  );

  // Now we delete all the trollies that do are not active
  // and they do not have barcodes associated with them
  await Promise.all(
    allTrollies.map(async (trolley) => {
      try {
        if (activeTrolleyIds.indexOf(trolley.trolleyId) !== -1) {
          return true;
        }

        await Trolleys.destroy({
          where: { trolleyId: trolley.trolleyId },
        });
      } catch (error) {
        logger.error(error);
      }
    }),
  );

  return true;
};

/**
 * Delete a single barcode and its associated trolley from SQL and Influx
 * @param {number} barcodeToDelete - The barcode that you want to delete
 * @returns {boolean} - true if the deletion was a success, otherwise false
 * @throws {Error} - any exception caught
 */
exports.deleteSingleBarcode = async (barcodeToDelete) => {
  // First find the barcodeObject in SQL
  const barcodeObject = await Barcodes.findOne({
    where: { barcode: barcodeToDelete },
  });

  // Return none if not found
  if (!barcodeObject) {
    // Try deleting from influxDB
    const result = await removeBarcodeFromInflux(barcodeToDelete);

    // If not deleted, we throw an error
    if (!result) {
      throw Error("error in deleting from influx. aborting delete");
    }
    return true;
  }

  try {
    // Try deleting from influxDB
    const result = await removeBarcodeFromInflux(barcodeObject.barcode);

    // If not deleted, we throw an error
    if (!result) {
      throw Error("error in deleting from influx. aborting delete");
    }

    // Destroy barcode
    await Barcodes.destroy({
      where: { barcode: barcodeObject.barcode },
    });

    // Delete if a trolley also exists
    if (barcodeObject.trolleyId) {
      await removeTrolley(barcodeObject.trolleyId);
    }

    return true;
  } catch (error) {
    throw Error(error.message);
  }
};

exports.deleteSingleTrolley = async (trolleyIdToDelete) => {
  // First find the trolleyObject in SQL
  const trolleyObject = await Trolleys.findOne({
    where: { trolleyId: trolleyIdToDelete },
  });

  // Return none if not found
  if (!trolleyObject) {
    throw Error("trolley not found in SQL");
  }

  try {
    // See if there is a barcode associated with the trolley
    if (trolleyObject.barcode) {
      await Barcodes.destroy({ where: { barcode: trolleyObject.barcode } });
      const result = await removeBarcodeFromInflux(trolleyObject.barcode);

      if (!result) {
        throw Error("error in deleting from influx. aborting delete");
      }
    }

    await removeTrolley(trolleyIdToDelete);
    return true;
  } catch (error) {
    throw Error(error.message);
  }
};

exports.deleteOverloadStations = async (stations = null) => {
  let stationIdsToDelete = [];

  if (stations) {
    stationIdsToDelete = stations;
  } else {
    stationIdsToDelete = (
      await Stations.findAll({
        attributes: ["stationId"],
      })
    ).map((obj) => obj.stationId);
  }

  await Promise.all(
    stationIdsToDelete.map(async (stationId) => {
      await removeOverloadFromInflux(stationId);
    }),
  );
};
