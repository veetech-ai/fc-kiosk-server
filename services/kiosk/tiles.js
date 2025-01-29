const { Op } = require("sequelize");
const { validateObject } = require("../../common/helper");
const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const CousreService = require("./course");

const { Tile, Course_Tile, Course } = models;

const _SKIP_KEYS = ["id", "tileId", "TileId", "createdAt", "updatedAt"];

const allowedFields = Object.keys(Tile.rawAttributes)
  .filter((key) => !_SKIP_KEYS.includes(key))
  .concat(
    Object.keys(Course_Tile.rawAttributes).filter(
      (key) => !_SKIP_KEYS.includes(key),
    ),
  );

const validateLayoutNumber = (number) => {
  if (number < 0 || number > 3) {
    throw new ServiceError("The layoutNumber must one of 0, 1, 2 or 4.", 400);
  }
};

exports.get = async ({ where = {}, paginationOptions }) => {
  const count = await Tile.count();
  const tiles = await Tile.findAll({ where, ...paginationOptions });

  return { count, tiles };
};

exports.getCourseTiles = async (gcId) => {
  await CousreService.getCourseById(gcId);
  return Course_Tile.findAll({
    where: { gcId },
    attributes: [
      ["id", "courseTileId"],
      "isSuperTile",
      "isPublished",
      "layoutNumber",
      "orderNumber",
      "gcId",
    ],
    order: [["orderNumber", "ASC"]],
    include: { model: Tile, attributes: ["id", "name", "builtIn", "bgImage"] },
  });
};

exports.getOne = async (where) => {
  const tile = await Tile.findOne({ where });
  if (!tile) throw new ServiceError("Tile Not Found", 404);

  // if (!tile.builtIn) {
  const tileData = await Course_Tile.findOne({ where: { tileId: tile.id } });
  return { tile, tileData };
  // }

  // return { tile };
};

exports.changeSuperTile = async (tileId, gcId, status = false) => {
  // throw error, if ids are not valid
  await CousreService.getCourseById(gcId);

  const courseTile = await Course_Tile.findOne({ where: { tileId, gcId } });

  if (!courseTile) throw new ServiceError("Tile Not Found", 404);

  if (courseTile.orderNumber != 1) {
    throw new ServiceError(
      "Only the tile with orderNumber 1 can be declared as super tile",
      400,
    );
  }

  const existingSuperTile = await Course_Tile.findOne({
    attributes: ["id"],
    where: { gcId, isSuperTile: true },
  });

  if (status && existingSuperTile) {
    throw new ServiceError("A super tile already exists for this course.", 400);
  }

  const [updatedRows] = await Course_Tile.update(
    { isSuperTile: status },
    { where: { tileId, gcId } },
  );

  if (!updatedRows) return "No change in db";

  return { tileId, gcId, isSuperTile: status };
};

exports.updateOrder = async (tileId, gcId, newOrder) => {
  const transact = await models.sequelize.transaction();
  try {
    // throw error, if ids are not valid
    await this.getOne({ id: tileId });
    await CousreService.getCourseById(gcId);

    const requestedTileInfo = await Course_Tile.findOne({
      where: { tileId, gcId },
      attributes: ["orderNumber"],
    });

    const order = {
      from: requestedTileInfo.orderNumber,
      to: newOrder,
    };

    const maxOrderNumber = await Course_Tile.count({
      where: { gcId },
    });

    const isNewOrderValid =
      order.to <= maxOrderNumber &&
      order.to >= 1 &&
      order.from <= maxOrderNumber &&
      order.from >= 1;

    if (maxOrderNumber && !isNewOrderValid) {
      throw new ServiceError(
        `The order must a number min: 1 and max: ${maxOrderNumber}`,
        400,
      );
    }

    if (order.to == order.from) {
      throw new ServiceError(
        "The newOrder value must not be same as current orderNumber",
        400,
      );
    }

    const beingMovedDownward = order.from - order.to < 0;
    const beingMovedUpward = order.from - order.to > 0;

    // update the order of other tiles accordingly
    if (beingMovedDownward) {
      await Course_Tile.update(
        { orderNumber: models.sequelize.literal("orderNumber - 1") },
        {
          where: {
            gcId,
            [Op.and]: {
              orderNumber: {
                [Op.gt]: order.from,
                [Op.lte]: order.to,
              },
            },
          },
        },
      );
    } else if (beingMovedUpward) {
      await Course_Tile.update(
        { orderNumber: models.sequelize.literal("orderNumber + 1") },
        {
          where: {
            gcId,
            [Op.and]: {
              orderNumber: {
                [Op.lt]: order.from,
                [Op.gte]: order.to,
              },
            },
          },
        },
      );
    }

    // update order of requested tile
    const [updatedRows] = await Course_Tile.update(
      { orderNumber: order.to },
      {
        where: {
          tileId,
          gcId,
        },
      },
    );

    if (!updatedRows) return "No update in db";

    await transact.commit();
    return { tileId, gcId, order };
  } catch (err) {
    transact.rollback();
    throw err;
  }
};

exports.changePublishStatus = async (tileId, gcId, status = false) => {
  // throw error, if ids are not valid
  await this.getOne({ id: tileId });
  await CousreService.getCourseById(gcId);

  const [updatedRows] = await Course_Tile.update(
    { isPublished: status },
    { where: { tileId, gcId } },
  );

  if (!updatedRows) return "No change in db";

  return { tileId, gcId, isPublished: status };
};

exports.create = async (data) => {
  const transact = await models.sequelize.transaction();
  try {
    const {
      name,
      gcId,
      isPublished = true,
      isSuperTile = false,
      layoutNumber = 0,
      bgImage = null,
      layoutData = null,
      layoutImages = null,
    } = validateObject(data, allowedFields);

    // 0. check if layout number is valid
    validateLayoutNumber(layoutNumber);

    // 1. check if the course exists
    await CousreService.getCourseById(gcId);

    // 2. if isSuperTile is true, then make sure its the only super tile
    if (isSuperTile === true || isSuperTile === "true") {
      const existingSuperTile = await Course_Tile.findOne({
        where: { [Op.and]: { gcId, isSuperTile: true } },
        attributes: ["id", "tileId"],
      });

      if (existingSuperTile) {
        throw new ServiceError(
          `A super tile already exists for this course. With id ${existingSuperTile.tileId}`,
          400,
        );
      }
    }

    // 3. check if order is valid order number
    const validMaxOrderNumber = await Course_Tile.count({
      where: { gcId },
    });

    // 4. check if current course already has a same tile with name
    const courseTiles = await Course_Tile.findAll({ where: { gcId } });
    const duplicateTile = await Tile.findOne({
      where: {
        [Op.and]: {
          name,
          id: { [Op.in]: courseTiles.map((ct) => ct.tileId) },
        },
      },
    });

    if (duplicateTile) {
      throw new ServiceError(
        "A tile with same name already exist for this course",
        400,
      );
    }

    // 4.a check if layoutImage provided without layoutData
    if (layoutImages && !layoutData) {
      throw new ServiceError(
        "Can not set layoutImages without layoutData",
        400,
      );
    }

    // 4.b The layoutNumber must not be zero if layoutData is provided
    if (layoutData && layoutNumber == 0) {
      throw new ServiceError(
        "The tile with custom layout can not have layoutNumber '0', use 1, 2 or 3 instead",
        400,
      );
    }

    // 5. create new tile with max order
    const tile = await Tile.create({ name, bgImage });
    const courseTile = await Course_Tile.create({
      tileId: tile.id,
      gcId,
      isPublished,
      isSuperTile,
      orderNumber: validMaxOrderNumber + 1,
      layoutNumber,
      layoutData,
      layoutImages,
    });

    await transact.commit();

    // 6. prepare and send the response
    return { ...tile.dataValues, ...courseTile.dataValues, id: tile.id };
  } catch (err) {
    transact.rollback();
    throw err; // forward the err to controller
  }
};

exports.delete = async (id) => {
  const transact = await models.sequelize.transaction();
  try {
    const { tile } = await this.getOne({ id });

    // update the order of the rest of the built in tiles for all courses
    if (tile.builtIn) {
      const uniqueGcIds = await Course_Tile.findAll({
        attributes: ["gcId"],
        group: ["gcId"],
      });

      const promises = [];

      for (const gc of uniqueGcIds) {
        const courseTile = await Course_Tile.findOne({
          where: { gcId: gc.gcId, tileId: tile.id },
        });

        if (!courseTile) continue;

        const pr = Course_Tile.update(
          { orderNumber: models.sequelize.literal("orderNumber - 1") },
          {
            where: {
              [Op.and]: {
                gcId: gc.gcId,
                orderNumber: {
                  [Op.gt]: courseTile.orderNumber,
                },
              },
            },
          },
        );

        promises.push(pr);
      }

      await Promise.all(promises);
    } else {
      // else update the order of custom tile
      const tileToDel = await Course_Tile.findOne({
        where: { tileId: tile.id },
      });
      await Course_Tile.update(
        { orderNumber: models.sequelize.literal("orderNumber - 1") },
        {
          where: {
            [Op.and]: {
              gcId: tileToDel.gcId,
              orderNumber: {
                [Op.gt]: tileToDel.orderNumber,
              },
            },
          },
        },
      );
    }

    // Finally delete the tile
    await Tile.destroy({ where: { id } });

    await transact.commit();

    return tile;
  } catch (error) {
    await transact.rollback();
    throw error;
  }
};

exports.updateTile = async (id, data) => {
  const transact = await models.sequelize.transaction();
  try {
    const tileToUpdate = await this.getOne({ id });
    if (!tileToUpdate) {
      throw new ServiceError("Tile Not Found.", 404);
    }

    // if (tileToUpdate.builtIn) {
    // enabling this - now can update builtIn tiles
    //   throw new ServiceError("Can not update a built in tile.", 400);
    // }

    const { name, isPublished, layoutNumber, layoutData, layoutImages } = data;

    if (layoutNumber) {
      validateLayoutNumber(layoutNumber);
    }

    // check if layoutImage not provided without layoutData
    if (layoutImages && !layoutData) {
      throw new ServiceError(
        "Can not set layoutImages without layoutData",
        400,
      );
    }

    // The layoutNumber must not be zero if layoutData is provided
    if (layoutData && layoutNumber == 0) {
      throw new ServiceError(
        "The tile with custom layout can not have layoutNumber '0', use 1, 2 or 3 instead",
        400,
      );
    }

    if (!layoutImages) data.layoutImages = null;

    await Tile.update(
      { name, bgImage: data.bgImage },
      {
        where: { id },
      },
    );

    await Course_Tile.update(
      {
        isPublished,
        layoutNumber,
        layoutData,
        layoutImages: data.layoutImages,
      },
      {
        where: { tileId: id },
      },
    );

    await transact.commit();

    return { tileId: id, data };
  } catch (err) {
    await transact.rollback();
    throw err;
  }
};

exports.assignDefaultTiles = async (gcId) => {
  const defaultTiles = await Tile.findAll({ where: { builtIn: true } });

  const payload = defaultTiles.map((tile) => ({
    tileId: tile.id,
    gcId,
    layoutNumber: 0,
    isPublished: true,
    isSuperTile: false,
    orderNumber: tile.id,
  }));

  await Course_Tile.bulkCreate(payload);
  return this.getCourseTiles(gcId);
};

exports.deleteCourseTile = async (tileId, gcId) => {
  const transact = await models.sequelize.transaction();
  try {
    const tile = await this.getOne({ id: tileId });
    await CousreService.getCourseById(gcId);

    const tileToDel = await Course_Tile.findOne({
      where: { tileId, gcId },
      attributes: ["orderNumber"],
    });

    await Course_Tile.destroy({ where: { tileId, gcId } });

    // destroy corresponding Tile entry too, if its created by user
    await Tile.destroy({ where: { id: tileId, builtIn: false } });

    // update the order of tiles in Course_Tiles
    await Course_Tile.update(
      { orderNumber: models.sequelize.literal("orderNumber - 1") },
      {
        where: {
          [Op.and]: {
            gcId,
            orderNumber: {
              [Op.gt]: tileToDel.orderNumber,
            },
          },
        },
      },
    );

    transact.commit();
    return tile;
  } catch (err) {
    transact.rollback();
    throw err;
  }
};
