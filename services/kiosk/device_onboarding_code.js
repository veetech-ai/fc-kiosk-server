const helper = require("../../common/helper");
const config = require("../../config/config");
const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const DeviceOnboardingCode = models.DeviceOnboardingCode;

function generateDeviceOnboardingCode() {
  const code = helper.generate_random_string({
    length: config.auth.kioskOnboardingAuth.otpLength,
    type: "numeric",
  });
  return code;
}

async function getValidDeviceOnboardingCode() {
  let code = await DeviceOnboardingCode.findOne({});
  const expiryLimitMS =
    config.auth.kioskOnboardingAuth.otpExpirationInSeconds * 1000;
  const timeNowMS = Date.now();

  const newCode = generateDeviceOnboardingCode();
  if (!code) {
    code = await DeviceOnboardingCode.create({ code: newCode });
  }

  const isExpired =
    new Date(code.updatedAt).getTime() + expiryLimitMS < timeNowMS;

  if (isExpired) {
    code = await code.update({ code: newCode });
  }

  return code;
}

async function refreshDeviceOnboardingCode() {
  const existingCode = await getValidDeviceOnboardingCode();

  const newCode = generateDeviceOnboardingCode();

  let updatedCode = await existingCode.update({ code: newCode });

  return updatedCode;
}

async function isValidDeviceOnboardingCode(code) {
  const existingCode = await getValidDeviceOnboardingCode();

  const isValidCode = existingCode?.code === code;
  return isValidCode;
}

module.exports = {
  getValidDeviceOnboardingCode,
  refreshDeviceOnboardingCode,
  isValidDeviceOnboardingCode,
};
