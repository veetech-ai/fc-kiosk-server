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

exports.getByPhone = async ({ phone }) => {
  return OTP.findOne({ where: { phone } });
};

exports.verifyCode = async (user, user_entered_code) => {
  const otpExpirationTimeMs = 1 * 60 * 1000;
  const otpAgeMs = new Date() - user.otp_created_at;
  if (otpAgeMs > otpExpirationTimeMs) {
    return { id: 1, reason: "Expiry date exceeded" };
  }

  if (user.code != user_entered_code) {
    return { id: 2, reason: "Invalid Code" };
  }

  await OTP.destroy({ where: { phone : user.phone } });

  return { id: 3, reason: "Valid Code" };
};
