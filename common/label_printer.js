// const Dymo = require('dymojs'), dymo = new Dymo();
// const fs = require('fs')
const helper = require("../common/helper");
const config = require("../config/config");

exports.print = (device, payload = null) => {
  let err = "";
  if (payload && payload.err) {
    err = parseInt(payload.err).toString(2);
    err = "00000000".substr(err.length) + err;
  }
  const msg = {
    i: device.id,
    s: device.serial,
    p: device.pin_code,
    ca: device.createdAt,
    cn: config.print.labels.companyName,
    cw: config.print.labels.companyWebsite,
    err: err,
    hwv: device.hw_ver || "HW Version not found",
  };

  helper.mqtt_publish_message("dlp", msg, false);
};
