const models = require("../models");
const InspectionHistory = models.Inspection;

exports.count = (where = false) => {
  return new Promise((resolve, reject) => {
    const query = {};
    if (where) {
      query.where = where;
    }
    InspectionHistory.count(query)
      .then((count) => {
        resolve(count);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

exports.findById = (inspectionHistoryId) => {
  return new Promise((resolve, reject) => {
    const query = {
      where: {
        id: inspectionHistoryId,
      },
    };
    InspectionHistory.findOne(query)
      .then((inspectionHistory) => {
        resolve(inspectionHistory);
      })
      .catch(() => {
        reject(new Error("inspectionHistory not found"));
      });
  });
};

exports.findByName = (inspectionHistoryName) => {
  return new Promise((resolve, reject) => {
    const query = {
      where: {
        name: inspectionHistoryName,
      },
    };
    InspectionHistory.findOne(query)
      .then((inspectionHistory) => {
        resolve(inspectionHistory);
      })
      .catch(() => {
        reject(new Error("inspectionHistory not found"));
      });
  });
};

exports.list = (sortingInfo, pp = false) => {
  return new Promise((resolve, reject) => {
    const query = {};
    if (pp) {
      query.limit = pp.limit;
      query.offset = pp.offset;
    }
    const modelIncludesSortByKey = Object.keys(
      InspectionHistory.tableAttributes,
    ).includes(sortingInfo?.sortBy);

    if (modelIncludesSortByKey) {
      query.order = [[sortingInfo.sortBy, sortingInfo.isDesc ? "DESC" : "ASC"]];
    }
    InspectionHistory.findAll(query).then(async (inspectionHistories) => {
      if (pp) {
        const count = await this.count();
        resolve({ data: inspectionHistories, count: count });
      } else {
        resolve({ data: inspectionHistories, count: null });
      }
    });
  });
};

exports.updateById = async (id, reqBody) => {
  const updated = await InspectionHistory.update(
    { ...reqBody },
    { where: { id } },
  );
  return updated;
};

exports.createInspectionHistory = async (reqBody) => {
  const inspectionHistoryExists = await InspectionHistory.findOne({
    where: { date: reqBody.date },
  });
  if (inspectionHistoryExists) {
    await this.updateById(inspectionHistoryExists.id, reqBody);
    return inspectionHistoryExists;
  } else {
    const newInspectionHistory = await InspectionHistory.create(reqBody);
    return newInspectionHistory;
  }
};

exports.updateInspectionHistoryByBody = async (reqBody) => {
  const updated = await InspectionHistory.update(
    { ...reqBody },
    { where: { date: reqBody.date } },
  );
  return updated;
};
