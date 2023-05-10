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
  const expiryLimitMS = config.auth.kioskOnboardingAuth.otpExpirationInSeconds * 1000
  const timeNowMS = Date.now();

  if(!code) {
    const newCode = generateDeviceOnboardingCode();
    code = await DeviceOnboardingCode.create({ code: newCode });
  }  

  const isExpired = new Date(code.updatedAt).getTime() + expiryLimitMS < timeNowMS 
  
  if(isExpired) {
    const newCode = generateDeviceOnboardingCode();
    code = await code.update({ code: newCode });
  }

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

} // no longer need this not in the main file aswell!

async function refreshDeviceOnboardingCode() {
  const existingCode = await getValidDeviceOnboardingCode();

  const newCode = generateDeviceOnboardingCode();
  let updatedCode;
  if (!existingCode) {
    updatedCode = await DeviceOnboardingCode.create({ code: newCode });
  } else {
    updatedCode = await existingCode.update({ code: newCode }); 
  }
  
  return updatedCode;
}

async function isValidDeviceOnboardingCode(code) {
  const existingCode = await getValidDeviceOnboardingCode();  
  // code.modifiedTime + exp > Date.now
  const isValidCode = existingCode?.code === code;
  return isValidCode;
}

module.exports = {
  getValidDeviceOnboardingCode,
  createDeviceOnboardingCode,
  refreshDeviceOnboardingCode,
  isValidDeviceOnboardingCode,
};
