const adScreen = require("../../models/ad-screen");
const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const screenConfigServices = require("../screenConfig/screens");
const membershipService = require("./membership");

const Course = models.Course;
const Organization = models.Organization;
const Advertisement = models.Ad;
const AdScreenModel = models.Ad_screen;

async function getAllAdScreens() {
  const allAds = await AdScreenModel.findAll({ raw: true });
  return allAds;
}

async function getAdScreenById(id) {
  const AdScreen = await AdScreenModel.findByPk(id);
  if (!AdScreen) {
    throw new ServiceError("Ad Screen ID was not found", 404);
  }
  return AdScreen.get({ plain: true });
}

module.exports = {
  getAllAdScreens,
  getAdScreenById,
};
