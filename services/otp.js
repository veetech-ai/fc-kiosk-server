const models = require("../models");
const OTP = models.OTP;

exports.create = async ({ phone, code }) => {
  const otpData = { phone, code, otp_createdAt: new Date(), otp_used: false };
  return OTP.create(otpData);
};

exports.getByPhone = async ({ phone }) => {
  return OTP.findOne({ where: { phone } });
};

exports.updateUsedStatus = async ({ phone, otp_used }) => {
  return OTP.update({ otp_used }, { where: { phone } });
};
