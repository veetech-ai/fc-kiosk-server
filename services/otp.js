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

exports.verifyCode = async (user, phoneNumber, user_entered_code) => {
  const otpExpirationTimeMs = 1 * 60 * 1000;
  const otpAgeMs = new Date() - user.otp_created_at;
  
  if (user.code != user_entered_code) throw new Error("Invalid Code");
  
  if (otpAgeMs > otpExpirationTimeMs) {
    await this.destroyOTP(phoneNumber);
    throw new Error("Expiry date exceeded");
  }

  await OTP.destroy({ where: { phone : user.phone } });
};

exports.destroyOTP = async (phone) => {
  await OTP.destroy({ where: { phone : phone } });
}
