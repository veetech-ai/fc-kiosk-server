const config = require("../config/config");
const models = require("../models");
const OTP = models.OTP;

exports.create = async ({ phone, code }) => {
  let otp = await OTP.findOne({ where: { phone } });
  if (!otp) {
    // Create a new OTP record if it does not exist
    const otpData = { phone, code, otp_created_at: new Date() };
    otp = await OTP.create(otpData);
  } else {
    // Update the code if the OTP record already exists
    otp.code = code;
    otp.otp_created_at = new Date();
    await otp.save();
  }
  return otp;
};

exports.getByPhone = async ({ phone, code }) => {
  return OTP.findOne({ where: { phone, code } });
};

exports.verifyCode = async (user, phoneNumber) => {
  const otpExpirationTimeMs =
    config.auth.mobileAuth.otpExpirationInSeconds * 1000;
  const currentTimeMs = new Date(Date.now()).getTime();
  const otpAgeMs = new Date(user.createdAt).getTime() + otpExpirationTimeMs;

  if (otpAgeMs < currentTimeMs) {
    await this.destroyOTP(phoneNumber);
    throw new Error("Expiry date exceeded");
  }

  await OTP.destroy({ where: { phone: user.phone } });
};

exports.destroyOTP = async (phone) => {
  await OTP.destroy({ where: { phone: phone } });
};