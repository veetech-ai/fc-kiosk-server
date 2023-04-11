const models = require("../models");
const PeopleMetricsModel = models.PeopleMetricsModel;

async function modelFileExist(userId) {
  const count = await PeopleMetricsModel.count({ where: { userId: userId } });
  if (count > 0) return true;
  return false;
}

exports.createPeopleMetricsModel = ({ userId, filePath }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isExists = await modelFileExist(userId);
      if (isExists) {
        await PeopleMetricsModel.update(
          { filePath: filePath },
          { where: { userId: userId } },
        );
        resolve("Record updated successfully");
      } else {
        await PeopleMetricsModel.create({ userId, filePath });
        resolve("Record created successfully");
      }
    } catch (err) {
      reject({ message: err });
    }
  });
};

exports.getUserModelUrl = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await PeopleMetricsModel.findOne({
        where: { userId: userId },
        attributes: ["file_path"],
      });
      const modelUrl = res?.dataValues?.file_path;
      if (!modelUrl) throw new Error("No model file exist for the user");
      resolve(modelUrl);
    } catch (err) {
      reject(err);
    }
  });
};

exports.deleteUserModelUrl = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const deleteResponse = await PeopleMetricsModel.destroy({
        where: { userId: userId },
      });
      if (!deleteResponse) throw new Error("No model file exist for the user");
      resolve("User model deleted successfully");
    } catch (err) {
      reject(err);
    }
  });
};
