const { uuid } = require("uuidv4");
const config = require("../config/config");
const models = require("../models");
const helpers = require("../common/helper");
const ServiceError = require("../utils/serviceError");
const OTP = models.OTP;

exports.create = async ({ phone, code }) => {
  let otp = await OTP.findOne({ where: { phone } });
  if (!otp) {
    // Create a new OTP record if it does not exist
    const otpData = { phone, code };
    otp = await OTP.create(otpData);
  } else {
    // Update the code if the OTP record already exists
    otp.code = code;
    otp.createdAt = new Date();
    await otp.save();
  }
  return otp;
};

exports.createForEmail = async ({ email, code }) => {
  let otp = await OTP.findOne({ where: { email } });
  if (!otp) {
    // Create a new OTP record if it does not exist
    const otpData = { email, code };
    otp = await OTP.create(otpData);
  } else {
    // Update the code if the OTP record already exists
    otp.code = code;
    otp.createdAt = new Date();
    await otp.save();
  }
  return otp;
};

exports.getByPhone = async ({ phone, code }) => {
  return OTP.findOne({ where: { phone, code } });
};

exports.getByEmail = async ({ email, code }) => {
  const otp = await OTP.findOne({ where: { email, code } });

  if (!otp) throw new Error("OTP is invalid", 400);

  return otp;
};

exports.getSession = async ({ email, code }) => {
  const otp = await this.getByEmail({ email, code });

  await this.checkExpiry(otp);

  otp.code = null;
  otp.session_id = uuid();
  await otp.save();

  return otp.session_id;
};

exports.verifySession = async ({ email, session_id }) => {
  const otp = await OTP.findOne({ where: { email, session_id } });

  if (!otp) {
    throw new ServiceError("Email is not verified", 400);
  }

  const otpCreationTimeMs = new Date(otp.createdAt).getTime();
  const fiveMinutesMs = 5 * 60 * 1000; // 5 minutes in milliseconds

  const sessionExpired = helpers.isExpired(otpCreationTimeMs, fiveMinutesMs);

  await otp.destroy();

  if (sessionExpired) {
    throw new ServiceError("Session has expired. Retry with new OTP", 401);
  }
};

// deletes invalid otp
exports.checkExpiry = async (otp, otpCreationTimeMs = null) => {
  const otpExpirationTimeMs =
    config.auth.mobileAuth.otpExpirationInSeconds * 1000;
  const currentTimeMs = otpCreationTimeMs || new Date(Date.now()).getTime();
  const otpAgeMs = new Date(otp.createdAt).getTime() + otpExpirationTimeMs;

  if (otpAgeMs < currentTimeMs) {
    await otp.destroy();
    throw new Error("Expiry date exceeded");
  }

  return otp;
};

exports.verifyCode = async (otp, otpCreationTimeMs = null) => {
  await this.checkExpiry(otp, otpCreationTimeMs);

  await OTP.destroy({ where: { phone: otp.phone } });
};

exports.destroyOTP = async (phone) => {
  await OTP.destroy({ where: { phone: phone } });
};
