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

async function createDeviceOnboardingCode() {
  const code = generateDeviceOnboardingCode();
  const createdCode = await DeviceOnboardingCode.create({ code });
  if (!createdCode) {
    throw new ServiceError("Unable to Create Device Onboarding code", 500);
  }
  return createdCode;
}

async function createDeviceOnboardingCodeIfNotCreated() {
  const existingCode = await DeviceOnboardingCode.findOne({});
  if (!existingCode) await createDeviceOnboardingCode();
}

async function refreshDeviceOnboardingCode() {
  const existingCode = await DeviceOnboardingCode.findOne({});
  if (!existingCode) {
    throw new ServiceError("No device onboarding code exists", 404);
  }
  const newCode = generateDeviceOnboardingCode();
  const updatedCode = await existingCode.update({ code: newCode });

  return updatedCode;
}

async function isValidDeviceOnboardingCode(code) {
  const existingCode = await DeviceOnboardingCode.findOne({});
  const isValidCode = existingCode?.code === code;
  return isValidCode;
}

module.exports = {
  createDeviceOnboardingCodeIfNotCreated,
  createDeviceOnboardingCode,
  refreshDeviceOnboardingCode,
  isValidDeviceOnboardingCode,
};
