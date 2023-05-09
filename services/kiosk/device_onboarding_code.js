const helper = require("../../common/helper");
const config = require("../../config/config");
const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const DeviceOnboardingCode = models.DeviceOnboardingCode;



async function createDeviceOnboardingCode() {
    const code = helper.generate_random_string({
        length: config.auth.kioskOnboardingAuth.otpLength,
        type: "numeric",
    });
    const createdCode = await DeviceOnboardingCode.create({ code })
    if(!createdCode) ServiceError("Unable to Create Device Onboarding code", 500);
    return createdCode
}

async function createDeviceOnboardingCodeIfNotCreated() {
    const existingCode = await DeviceOnboardingCode.findOne({})
    if (!existingCode) await createDeviceOnboardingCode();
}

module.exports = {
    createDeviceOnboardingCodeIfNotCreated,
};
