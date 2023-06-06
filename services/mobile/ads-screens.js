const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const AdsScreen = models.Ad_screen;

async function getAdsScreens(where, loggedInUserOrgId) {
  const clonedWhere = { ...where };
  if (loggedInUserOrgId) clonedWhere.orgId = loggedInUserOrgId;
  const adsScreens = await AdsScreen.findAll({ where: clonedWhere });
  return adsScreens;
}

module.exports = {
  getAdsScreens,
};
