const models = require("../models");
const OTP = models.OTP;

exports.create = async ({ phone, code }) => {
  let otp = await OTP.findOne({ where: { phone } });
  if (!otp) {
    // Create a new OTP record if it does not exist
    const otpData = { phone, code, otp_createdAt: new Date(), otp_used: false };
    otp = await OTP.create(otpData);
  } else {
    // Update the code if the OTP record already exists
    otp.code = code;
    otp.otp_createdAt = new Date();
    await otp.save();
  }
  return otp;
};

exports.getByPhone = async ({ phone }) => {
  return OTP.findOne({ where: { phone } });
};

exports.updateUsedStatus = async ({ phone, otp_used }) => {
  return OTP.update({ otp_used }, { where: { phone } });
};
