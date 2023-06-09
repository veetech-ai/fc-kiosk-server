const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const AdsScreen = models.Ad_screen;

async function getAdsScreens(where, loggedInUserOrgId) {
  const clonedWhere = { ...where };
  if (loggedInUserOrgId) clonedWhere.orgId = loggedInUserOrgId;
  const adsScreens = await AdsScreen.findAll({ where: clonedWhere });
  return adsScreens;
}
async function validateScreens(inputAdsScreens) {
  const adsScreens = await getAdsScreens({});
  const adsScreensFromDb = adsScreens.map(
    (adScreen) => adScreen.dataValues.name,
  );
  const areInputScreensValid = inputAdsScreens.every((val) =>
    adsScreensFromDb.includes(val),
  );
  if (!areInputScreensValid) {
    throw new ServiceError("Please enter valid screen names", 400);
  }
  return areInputScreensValid;
}

module.exports = {
  getAdsScreens,
  validateScreens,
};
