// External Modules
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const randtoken = require("rand-token");
const axios = require("axios");
const moment = require("moment");
const Ajv = require("ajv");
const { cloneDeep, pickBy } = require("lodash");

// Logger Imports
const { logger } = require("../logger");

// Common Imports
const pdf = require("./pdf");
const slack = require("./slack");
const sms = require("./sms");
const device_log = require("./device_log");
const firebase = require("./firebase");
const { getFileURL } = require("./upload");
const { getRolesWithAuthorities } = require("./roles_with_authorities");
const { roleWithAuthorities } = getRolesWithAuthorities();
const { insertInfluxData } = require("./influxHelper");

// MySQL Schema Imports
const automaAlertsSchema = require("./../digital-fairways-commons/schemas/automa-alerts-names.json");
// Alerts Data Imports
const automaAlertsData = require("./../digital-fairways-commons/data/automa-alerts.json");
// Influx Schema Imports
const automaAlertsInfluxSchema = require("./../digital-fairways-commons/influxSchemas/automa-alerts.json");

// Query Imports
const MQTTLogsModel = require("../services/mqtt_logs");
const DeviceMetadataModel = require("../services/device_metadata");
const DeviceVPLogsModel = require("../services/device_vp_logs");
const DeviceLogsCountsModel = require("../services/device_log_counts");
const FvResetsModel = require("../services/fv_resets");
const FvRuntimesModel = require("../services/fv_runtimes");
const FvReportsModel = require("../services/fv_reports");
const DeviceModel = require("../services/device");
const UserModel = require("../services/user");
const { getRoleByTitle } = require("../services/role");

// Configuration Imports
const settings = require("../config/settings");
const config = require("../config/config");

const alertsCategories = require("./../digital-fairways-commons/data/alerts-categories.json");

// Definitions Imports
const definitionsValidations = require("./../digital-fairways-commons/definitions/validations.json");
const { globalMQTT } = require("./mqtt-init");

// Setting Up Ajv
const ajv = new Ajv({ allErrors: true, useDefaults: true }); // options can be passed, e.g. {allErrors: true}
ajv.addSchema(definitionsValidations);

// Setting Salt Rounds
const saltRounds = parseInt(config.jwt.saltRounds);

// Setting Global Regex Variables
const date = "20[0-9][0-9]-(0[0-9]|1[0-2])-([0-2][0-9]|3[0-1])";
const time =
  "T([0-1][0-9]|[2][0-3]):[0-5][0-9]:[0-5][0-9]([.][0-9]+)?(Z|([+-][0-2][0-9]:(0|3)0))";
const filterRegexString = `^(${date})$|^today$|^yesterday$|^[0-9]{1,2}d$|^[0-9]{1,2}m$|^(${date}\\|${date})$|^(${date}${time}\\|${date}${time})$`;
const dateTimeRange = `^${date}${time}\\|${date}${time}$`;
const dateRegexString = `^${date}$`;

exports.filterRegex = new RegExp(filterRegexString);
exports.productIdRegex = new RegExp(/((\w{1,})[\s-]?)+(\|[\w-?\s?]+)*$/);
exports.dateTimeRangeRegex = new RegExp(dateTimeRange);
exports.dateRegex = new RegExp(dateRegexString);

// eslint-disable-next-line no-useless-escape
const phone = "^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$";
exports.PhoneRegex = new RegExp(phone);

const letters = /^[a-zA-Z\s0-9_'-]*$/;
exports.LettersAndSpacesRegex = new RegExp(letters);

// Setting Faults Object
const Faults = Object.freeze({
  batteryCharging: 0,
  batteryCharged: 1,
  vbatAlert: 5,
  battNoCharging: 9,
  barcodeFailed: 10,
  cardDispenserFailed: 11,
  cardDispenserStockLow: 12,
  cardDispenserStockEnd: 13,
  fingerPrintError: 14,
});

exports.get_device_type_id_by_type = (type) => {
  //  1=autma, 2=geyser, 3=solar, 4=motor, 5=tank, 6=motor and tank, 7=enery audit
  const devices = {
    ac: 1,
    geyser: 2,
    solar: 3,
    motor: 4,
    tank: 5,
    motortank: 6,
    eneryaudit: 7,
    vent: 8,
  };
  return devices[type];
};

exports.setPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) {
        reject({ message: err });
      } else {
        bcrypt.hash(password, salt, function (err, hash) {
          if (hash) {
            resolve(hash);
          } else {
            logger.error(err);
            reject("There is a problem. Please try later");
          }
        });
      }
    });
  });
};

exports.matchPassword = (password, user_password) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user_password, function (err, hash) {
      if (hash) {
        resolve(hash);
      } else {
        logger.error(err);
        reject("Invalid Password");
      }
    });
  });
};

exports.createJwtToken = (data) => {
  try {
    const token = jwt.sign(
      {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        admin: data.user.is_admin,
        super_admin: data.user.super_admin,
        orgId: data.user.orgId,
        expire_time: parseInt(data.expire_time),
        remember: data.user.remember,
        lb_sa: data.user.lb_sa || null,
        role: data.user.Role ? data.user.Role : data.user.role,
      },
      config.jwt.secret,
      { expiresIn: parseInt(data.expire_time) },
    );

    return token;
  } catch (err) {
    logger.error(err);
  }
};
exports.refreshJwtToken = (token) => {
  try {
    const user = jwt.verify(token, config.jwt.secret);
    const accessTokenExpiry = user?.remember
      ? config.jwt.expirationLongInSeconds
      : config.jwt.expirationShortInSeconds;
    const new_token = this.createJwtToken({
      user: user,
      expire_time: parseInt(accessTokenExpiry),
    });

    const refresh_token = this.createJwtToken({
      user: user,
      expire_time: parseInt(config.jwt.refreshExpirationInSeconds),
    });

    return { accessToken: new_token, refreshToken: refresh_token };
  } catch (err) {
    return false;
  }
};
exports.generate_verify_token = (length = 150) => {
  return randtoken.generate(length);
};

exports.generate_token = (length = 50) => {
  return randtoken.generate(length);
};

exports.default_remote_settings = () => {
  return {
    p: 0,
    m: 0,
    t: 22,
    f: 1,
    sv: 1,
    sh: 1,
    svp: 0,
    shv: 0,
    rt: 0,
    fl: 0,
    s: 0,
    h: 0,
    b: 0,
    ton: {
      h: 0,
      m: 0,
      ts: null,
    },
    toff: {
      h: 0,
      m: 0,
      ts: null,
    },
    sb: "webapp",
    tsm: Date.now() / 1000,
  };
};

exports.get_diagnostics_from_hexa = (number) => {
  number = parseInt(number);

  // var binary = number.toString(2);
  const hexa = number.toString(16);

  return {
    batteryCharging: !!(number & (1 << Faults.batteryCharging)),
    batteryCharged: !!(number & (1 << Faults.batteryCharged)),
    vbatAlert: !!(number & (1 << Faults.vbatAlert)),
    battNoCharging: !!(number & (1 << Faults.battNoCharging)),
    barcodeFailed: !!(number & (1 << Faults.barcodeFailed)),
    cardDispenserFailed: !!(number & (1 << Faults.cardDispenserFailed)),
    cardDispenserStockLow: !!(number & (1 << Faults.cardDispenserStockLow)),
    cardDispenserStockEnd: !!(number & (1 << Faults.cardDispenserStockEnd)),
    fingerPrintError: !!(number & (1 << Faults.fingerPrintError)),
    last_hexa: hexa,
  };
};

exports.bufToNumber = (buf) => {
  let num = 0;
  for (let i = buf.length - 1; i >= 0; i--) {
    num = num * 256 + Number(buf[i]);
  }
  return num;
};

exports.set_mqtt_connection_lost_log = (message) => {
  const self = this;

  logger.info(`ConnectionLost ${message}`);

  self.send_slack(`Node server MQTT ConnectionLost ["${message}"].`);

  MQTTLogsModel.create({
    client_id: mqtt_client_id,
    type: "ConnectionLost",
    origin: message,
    action_datetime: self.tsISOString(),
  });
};

exports.set_mqtt_connection_failure_log = (message) => {
  const self = this;
  logger.warn("ConnectionFailure " + message);
  MQTTLogsModel.create({
    client_id: mqtt_client_id,
    type: "ConnectionFailure",
    origin: message,
    action_datetime: self.tsISOString(),
  });
};

exports.mqtt_publish_message = (
  channel,
  message,
  retained = true,
  qos = 1,
  stringify = true,
) => {
  try {
    const msg = stringify ? JSON.stringify(message) : message;
    globalMQTT.client.publish(channel, msg, {
      qos,
      retain: retained,
    });
  } catch (err) {
    logger.error(err);
  }
};

exports.mqtt_subscribe_channel = (channel, qos = 1) => {
  if (config.mqtt.mqttEnabled !== "true") {
    return;
  }
  try {
    if (settings.get("mqtt_group")) {
      channel = `$share/${settings.get("mqtt_group")}/${channel}`;
    }
    globalMQTT.client.subscribe(channel, {
      qos: qos,
    });
  } catch (err) {
    logger.error(err);
  }
};

exports.send_slack = (message, hook = null) => {
  return new Promise((resolve, reject) => {
    slack
      .send(message, hook)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};

exports.send_slack_forcefully = (message, hook = null) => {
  return new Promise((resolve, reject) => {
    slack
      .send_forcefully(message, hook)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};

exports.send_sms = (phone, message) => {
  return new Promise((resolve, reject) => {
    sms
      .send(phone, message)
      .then(function (response) {
        resolve(response);
      })
      .catch(function (error) {
        reject({ message: error.message });
      });
  });
};

exports.publish_diagnostic_message = (
  device_id,
  diagnostics,
  alertsCategoriesIndications,
  alertsData,
) => {
  // ind => indications
  try {
    if (mqtt_connection_ok) {
      const allAlerts = alertsData.map((alert) => alert.name);
      if (allAlerts.length > 0) {
        const diagnosticsAsArray = Object.entries(diagnostics);
        const filteredDiagnostics = diagnosticsAsArray.filter(([key, value]) =>
          allAlerts.includes(key),
        );
        const filteredDiagnosticsObject =
          Object.fromEntries(filteredDiagnostics);
        const dataToSend = {
          ind: alertsCategoriesIndications,
          at: filteredDiagnosticsObject,
        };
        this.mqtt_publish_message(
          `d/${device_id}/fdiagnos`,
          { ...dataToSend },
          false,
        );
      }
    }
  } catch (error) {
    logger.error(error.message);
  }
};

exports.send_api_request = (data) => {
  return new Promise((resolve, reject) => {
    if (data) {
      const endpoint = data.url || null;
      const method = data.method || "get";
      const params = data.params || {};
      const headers = data.headers || {};

      if (endpoint) {
        switch (method) {
          case "get": {
            const query_params = params
              ? `?${new URLSearchParams(params).toString()}`
              : "";
            axios
              .get(`${endpoint}${query_params}`, { headers: headers })
              .then((response) => {
                resolve(response);
              })
              .catch((error) => {
                reject(error);
              });
            break;
          }
          case "post": {
            axios
              .post(`${endpoint}`, params, { headers: headers })
              .then((response) => {
                resolve(response);
              })
              .catch((error) => {
                reject(error);
              });
            break;
          }
          case "put": {
            axios
              .put(`${endpoint}`, params, { headers: headers })
              .then((response) => {
                resolve(response);
              })
              .catch((error) => {
                reject(error);
              });
            break;
          }
          case "delete": {
            axios
              .delete(`${endpoint}`, { headers: headers }, params)
              .then((response) => {
                resolve(response);
              })
              .catch((error) => {
                reject(error);
              });
            break;
          }
        }
      } else {
        reject({ message: "URL not provided" });
      }
    } else {
      reject({ message: "Arguments not supplied for curl request" });
    }
  });
};
exports.set_debugv0 = (payload, source = 1) => {
  return new Promise((resolve, reject) => {
    try {
      const self = this;
      try {
        const metadata = JSON.parse(payload);
        DeviceModel.findById(metadata.did)
          .then((device_data) => {
            if (metadata.did && metadata.fv) {
              const params = [];
              let type = 1;

              const fv_reports = {};
              fv_reports.fv = metadata.fv;
              let log = "";
              Object.keys(metadata).forEach(function (key) {
                if (key != "did" && key != "fv") {
                  log = device_log
                    .v0_placeholder(key, metadata[key])
                    .replace("[did]", metadata.did)
                    .replace("[fv]", metadata.fv);
                  let value = "";
                  if (typeof metadata[key] === "object") {
                    value = JSON.stringify(metadata[key]);

                    Object.keys(metadata[key]).forEach(function (inner_key) {
                      let replace_val = metadata[key][inner_key];
                      if (inner_key == "fcode") {
                        replace_val = device_log.fcode(
                          metadata[key][inner_key],
                        );
                      }
                      if (inner_key == "rs_code") {
                        replace_val = device_log.rs_code(
                          metadata[key][inner_key],
                        );
                      }

                      log = log.replace(`[${inner_key.trim()}]`, replace_val);
                    });

                    if (key == "RunT") {
                      FvRuntimesModel.set({
                        device_id: metadata.did,
                        fv: metadata.fv,
                        resets: metadata[key].resetC,
                        runt: metadata[key].RunT,
                      })
                        .then(() => {})
                        .catch((err) => {
                          logger.error(err);
                        });
                    }
                  } else {
                    value = metadata[key];
                    log = log.replace(`[${key}]`, value);

                    if (key == "resetC") {
                      FvResetsModel.set({
                        device_id: metadata.did,
                        fv: metadata.fv,
                        resets: metadata[key],
                      })
                        .then(() => {})
                        .catch((err) => {
                          logger.error(err);
                        });
                    }
                  }

                  type = device_log.v0_get_type(key);
                  const row = {
                    device_id: metadata.did,
                    fv: metadata.fv,
                    type: type,
                    key: key,
                    value: value,
                    log: log,
                  };

                  params.push(row);
                }
              });
              logger.info(log);

              if (params.length <= 0) {
                params.push({
                  device_id: metadata.did,
                  fv: metadata.fv,
                });
              }

              fv_reports.type = type;
              FvReportsModel.setv0(fv_reports)
                .then(() => {})
                .catch(() => {});
              DeviceLogsCountsModel.setv0({
                device_id: metadata.did,
                type: type,
              })
                .then(() => {})
                .catch(() => {});
              DeviceMetadataModel.bulk_create(params)
                .then(() => {
                  const device_slack_allow = !(
                    device_data &&
                    (device_data.slack_notifications == 0 ||
                      !device_data.slack_notifications)
                  );
                  if (source == 1 && type == 1 && device_slack_allow) {
                    self
                      .send_slack(log, config.slack.deviceToChannel)
                      .then(() => {})
                      .catch(() => {});
                  }
                  resolve(log);
                })
                .catch((err) => {
                  reject({ message: err });
                });
            } else {
              reject({ message: "Invalid debugv0 topic message" });
            }
          })
          .catch((err) => {
            reject({ message: err });
          });
      } catch (err) {
        logger.info("****************");
        logger.error(err);
        logger.info("****************");
        reject({ message: err });
      }
    } catch (err) {
      reject({ message: err });
    }
  });
};

exports.set_debugvp = (payload, source = 1) => {
  return new Promise((resolve, reject) => {
    try {
      const self = this;
      const metadata = JSON.parse(payload);

      DeviceModel.findById(metadata.did)
        .then((device_data) => {
          if (metadata.did && metadata.fv) {
            let priority = 2; // low priority by default
            if (metadata.p) {
              priority = metadata.p;
            }

            let log = "";

            if (metadata.ec) {
              // EC Case
              log = device_log
                .vp_esp(metadata.ec)
                .replace("[did]", metadata.did)
                .replace("[fv]", metadata.fv);

              FvReportsModel.setvp({ fv: metadata.fv, type: priority })
                .then((result) => {})
                .catch(() => {});
              DeviceLogsCountsModel.setvp({
                device_id: metadata.did,
                type: priority,
              })
                .then((result) => {})
                .catch(() => {});
              DeviceVPLogsModel.bulk_create([
                {
                  device_id: metadata.did,
                  fv: metadata.fv,
                  type: priority,
                  key: "ec",
                  value: metadata.ec,
                  log: log,
                },
              ])
                .then((result) => {
                  const device_slack_allow = !(
                    device_data &&
                    (device_data.slack_notifications == 0 ||
                      !device_data.slack_notifications)
                  );
                  if (priority == 1 && device_slack_allow) {
                    self
                      .send_slack(log + " (ec)", config.slack.channelPUART)
                      .then((slack_res) => {})
                      .catch(() => {});
                  }
                  resolve(log);
                })
                .catch((err) => {
                  reject({ message: err });
                });
              // EC Case END
            } else if (metadata.dc || metadata.ac) {
              let key = metadata.dc;
              let key_label = "dc";
              let bits_limit = 32;
              if (metadata.ac) {
                key = metadata.ac;
                key_label = "ac";
                bits_limit = 10;
              }

              const decimal = parseInt(key);
              const params = [];
              for (let i = 0; i < bits_limit; i++) {
                if (decimal & (1 << i)) {
                  const val = metadata.ac
                    ? device_log.vp_ac(i.toString())
                    : device_log.vp_dc(i.toString());
                  log = val.msg
                    .replace("[did]", metadata.did)
                    .replace("[fv]", metadata.fv);
                  if (!metadata.p) {
                    priority = val.p;
                  }

                  FvReportsModel.setvp({ fv: metadata.fv, type: priority })
                    .then((result) => {})
                    .catch(() => {});
                  DeviceLogsCountsModel.setvp({
                    device_id: metadata.did,
                    type: priority,
                  })
                    .then((result) => {})
                    .catch(() => {});
                  params.push({
                    device_id: metadata.did,
                    fv: metadata.fv,
                    type: priority,
                    key: key_label,
                    value: key,
                    log: log,
                  });
                  const device_slack_allow = !(
                    device_data &&
                    (device_data.slack_notifications == 0 ||
                      !device_data.slack_notifications)
                  );
                  if (priority == 1 && device_slack_allow) {
                    self
                      .send_slack(
                        log + ` (${key_label})`,
                        config.slack.channelPUART,
                      )
                      .then((slack_res) => {})
                      .catch(() => {});
                  }
                }
              }
              DeviceVPLogsModel.bulk_create(params)
                .then((result) => {
                  resolve(log);
                })
                .catch((err) => {
                  reject({ message: err });
                });
            }
          } else {
            reject({ message: "Invalid debugvp topic message" });
          }
        })
        .catch((err) => {
          reject({ message: err });
        });
    } catch (err) {
      reject({ message: err });
    }
  });
};

exports.set_indicator = (deviceId, diagnostics, alertsData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { alertsCategoriesDetails, alertsCategoriesIndications } =
        this.getAlertsCategoriesAndIndications();
      alertsData.forEach((alert) => {
        if (alert.name in diagnostics && diagnostics[alert.name] == true) {
          const cat = alertsCategoriesDetails.filter(
            (data) => data.name === alert.category,
          );
          if (cat.length) {
            alertsCategoriesIndications[cat[0].indicationField] = true;
          }
        }
      });
      DeviceModel.update_where(alertsCategoriesIndications, { id: deviceId })
        .then((result) => {
          resolve(alertsCategoriesIndications);
        })
        .catch((error) => {
          reject(error);
        });
    } catch (error) {
      logger.error(error);
      reject(error);
    }
  });
};

exports.set_device_last_seen = (data) => {
  return new Promise((resolve, reject) => {
    if (data) {
      let fi = false;
      Object.keys(data).forEach(function (key) {
        if (
          key != "battery_charged" &&
          key != "battery_charging" &&
          key != "id" &&
          key != "device_id" &&
          key != "last_hexa" &&
          key != "createdAt" &&
          key != "updatedAt"
        ) {
          if (
            typeof data[key] !== "undefined" &&
            (data[key] == 1 || data[key] == true || data[key])
          ) {
            fi = true;
          }
        }
      });

      DeviceModel.update_where({ fi: fi }, { id: data.device_id })
        .then((result) => {})
        .catch(() => {});
    }
  });
};

exports.set_device_forcefully_status = (device_id, status, ts = false) => {
  if (mqtt_connection_ok) {
    this.set_mqtt_connection_lost_log(
      "NAPP helper.js.set_device_forcefully_online_status:",
    );
    const message = { status: status };
    if (ts) {
      message.ts = this.ts_now();
    }
    this.mqtt_publish_message(`d/${device_id}/status`, message);
    return true;
  } else {
    return false;
  }
};

exports.ts_now = () => {
  return Date.now() / 1000;
};

exports.tsISOString = () => {
  const date = new Date();
  return date.toISOString();
};

exports.set_time_series_data = (
  data,
  measurement = config.influx.measurement,
) => {
  // TODO: Enable this function and enable in IA as well
  // const self = this
  // try {
  //   const fields = {}
  //   // validation data fields
  //   const allowed_fields = Object.keys(influx[`${measurement}_fields`])
  //   for (const key in data.fields) {
  //     if (Object.prototype.hasOwnProperty.call(data.fields, key) && allowed_fields.indexOf(key) >= 0) {
  //       fields[key] = data.fields[key]
  //     }
  //   }
  //   // inserting data in influxdb
  //   global_influx.writePoints([{
  //     measurement: measurement,
  //     tags: { device_id: data.device_id },
  //     fields: fields
  //   }]).then(resp => {
  //     influx_connection_ok = true
  //   }).catch(err => {
  //     logger.info('InfluxDB Error writePoints Catch')
  //     logger.info(err)
  //     if (influx_connection_ok) {
  //       self.send_slack('InfluxDB writePoints error', config.slackInfluxChannel).then(result => { }).catch(() => { })
  //       influx_connection_ok = false
  //     }
  //   })
  // } catch (err) {
  //   logger.info('InfluxDB Error TryCatchBlock')
  //   logger.info(err)
  //   if (influx_connection_ok) {
  //     self.send_slack('InfluxDB tryCatchBlock error', config.slackInfluxChannel).then(result => { }).catch(() => { })
  //     influx_connection_ok = false
  //   }
  // }
};

exports.set_time_series_data_with_ts = (
  data,
  measurement = config.influx.measurement,
) => {
  // const self = this
  try {
    // const fields = {}
    logger.info(data);
    let timestamp = 0;
    if (data.fields.tsm) {
      timestamp = data.fields.tsm;
    } else if (data.fields.ts) {
      timestamp = data.fields.ts * 1000;
    }
    // validation data fields
    // const allowed_fields = Object.keys(influx[`${measurement}_fields`])
    // for (const key in data.fields) {
    //   if (Object.prototype.hasOwnProperty.call(data.fields, key) && allowed_fields.indexOf(key) >= 0) {
    //     fields[key] = data.fields[key]
    //   }
    // }
    const formatedData = {
      device_id: data.device_id,
      timestamp: timestamp,
    };
    delete data.fields.tsm;
    Object.assign(formatedData, data.fields);
    insertInfluxData(timestamp, formatedData);
  } catch (err) {
    logger.info("InfluxDB Error TryCatchBlock");
    logger.error(err);
    if (influx_connection_ok) {
      // self.send_slack(`InfluxDB tryCatchBlock error. ERROR: ${err.message}`, config.slackInfluxChannel).then(result => {}).catch(() => {});
      influx_connection_ok = false;
    }
    return false;
  }
};

exports.send_push = (message) => {
  return new Promise((resolve, reject) => {
    firebase
      .send(message)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};

exports.generate_pdf = (html, pdf_file_name = false, options = false) => {
  return new Promise((resolve, reject) => {
    pdf
      .generate(html, pdf_file_name, options)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

exports.ejs_file_content = (file_path, data) => {
  const ejs = require("ejs");

  const template = this.get_file_content(file_path);
  return ejs.render(template, data);
};

exports.get_file_content = (file_path, options = false) => {
  const fs = require("fs");
  if (!options) {
    options = { encoding: "utf-8" };
  }
  return fs.readFileSync(file_path, options);
};
exports.get_file_content_without_options = (file_path) => {
  const fs = require("fs");
  return fs.readFileSync(file_path);
};

exports.generate_random_string = (params) => {
  const cryptoRandomString = require("crypto-random-string");
  /**
   * Type:
   * Type can be, base64, url-safe, numeric, distinguishable,
   */
  const length = params.length || 10;
  const data = {
    length: length,
  };
  if (params.type) {
    data.type = params.type;
  }

  return cryptoRandomString(data);
};

exports.get_user_from_token = (req) => {
  const secret = config.jwt.secret;
  const jwt = require("jsonwebtoken");

  if (req.headers.authorization) {
    try {
      return jwt.verify(req.headers.authorization, secret);
    } catch (err) {
      return false;
    }
  } else {
    return false;
  }
};

exports.number_with_commas = (x) => {
  if (!x) {
    x = 0;
  }
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

exports.get_pagination_params = ({ limit, page, search }) => {
  limit = parseInt(limit) || parseInt(config.tableRecordsLimit);
  page = parseInt(page) || 1;
  search = search || false;
  let offset = (page - 1) * limit;

  if (page <= 0) page = 1;
  if (offset <= 0) offset = 0;
  if (limit < 0) limit *= -1;
  return { limit, offset, search };
};

exports.get_pagination_params = ({ limit, page, search }) => {
  limit = parseInt(limit) || parseInt(config.tableRecordsLimit);
  page = parseInt(page) || 1;
  search = search || false;
  let offset = (page - 1) * limit;

  if (page <= 0) page = 1;
  if (offset <= 0) offset = 0;
  if (limit < 0) limit *= -1;
  return { limit, offset, search };
};

exports.get_order_status = (status) => {
  let order_status = "Rejected";
  if (status == 0) {
    order_status = "Not completed";
  } else if (status == 1) {
    order_status = "Completed";
  } else if (status == 2) {
    order_status = "In Progress";
  } else if (status == 3) {
    order_status = "Cancel by user";
  } else if (status == 4) {
    order_status = "Waiting Payment";
  } else if (status == 5) {
    order_status = "Delivering";
  }
  return order_status;
};

exports.user_2fa_enabled = async (user_id) => {
  let result = false;
  const User2FAModel = require("../services/user_2fa");
  const ConfigurationsModel = require("../services/configurations");

  const configuration = await ConfigurationsModel.get();
  if (configuration.config.tfa) {
    const setting = await User2FAModel.findByID(user_id);
    if (setting && setting.status) {
      result = true;
    }
  }
  return result;
};

exports.getTokenExpiry = (
  roleInfo,
  tokenExpirySeconds,
  extendRolesExpiry = [],
  extendBySeconds = 0,
) => {
  let tokenExpiry = parseInt(tokenExpirySeconds);
  const isAllowedRole = extendRolesExpiry.includes(roleInfo.title);
  const isNumber = !Number.isNaN(Number(extendBySeconds));
  if (isAllowedRole && isNumber) tokenExpiry += extendBySeconds;
  return tokenExpiry;
};

exports.get_user_auth_tokens = (req, user) => {
  const user_obj = JSON.parse(JSON.stringify(user));
  const expire_time =
    req.body.remember && req.body.remember == true
      ? config.jwt.expirationLongInSeconds
      : config.jwt.expirationShortInSeconds;

  user_obj.remember = req?.body?.remember
    ? JSON.parse(req.body.remember)
    : false;
  user_obj.expire_time = parseInt(expire_time);
  user_obj.admin = !!this.hasProvidedRoleRights(user.Role, ["admin"]).success;
  user_obj.super_admin = !!this.hasProvidedRoleRights(user.Role, ["super"])
    .success;
  return {
    accessToken: this.createJwtToken({
      user: user_obj,
      expire_time: user_obj.expire_time,
    }),
    refreshToken: this.createJwtToken({
      user: user_obj,
      expire_time: this.getTokenExpiry(
        user_obj?.Role,
        config.jwt.refreshExpirationInSeconds,
        [roleWithAuthorities.device.title],
        config.jwt.tokenExpiryExtensionSeconds,
      ),
    }),
  };
};

exports.slugToTitle = (slug) => {
  let words = slug.split("-");

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    words[i] = word.charAt(0).toUpperCase() + word.slice(1);
  }
  words = words.join(" ").replace(/-/g, " ").replace(/_/g, " ");
  words = words.split("(").join("");
  return words.split(")").join("");
};

exports.beutify_file_name = (filename) => {
  let new_file_name = "";

  filename = filename.split(".");
  if (filename.length > 1) {
    delete filename[filename.length - 1];
  }

  new_file_name = this.slugToTitle(filename.join(" "));

  return new_file_name;
};

exports.hasProvidedRoleRights = (roleObject, requiredRoleRights) => {
  const userRights = Object.entries(roleObject.dataValues || roleObject)
    .filter((entry) => entry[1] === true)
    .map((trueKey) => trueKey[0]);
  const hasAtleastOneRight =
    userRights.filter((requiredRight) =>
      requiredRoleRights.includes(requiredRight),
    ).length !== 0;
  return { success: hasAtleastOneRight, userRights };
};

exports.hasOwnOrganizationDeviceAccess = async (
  req,
  deviceId,
  requiredRoleRights = null,
) => {
  try {
    if (!req.user) return { success: false, message: "Token not provided" };

    const role = req.user.role
      ? await getRoleByTitle(req.user.role.title)
      : null;
    if (!role) return { success: false, message: "Role not found" };

    if (role.super || role.admin) return { success: true, message: "Allowed" };

    if (requiredRoleRights) {
      const hasRequiredRoleRights = this.hasProvidedRoleRights(
        role,
        requiredRoleRights,
      );
      if (!hasRequiredRoleRights.success) {
        return {
          success: false,
          message: "Unauthorized to perform the action",
        };
      }
    }

    const foundDevice = await DeviceModel.findById(deviceId);
    if (!foundDevice) return { success: false, message: "Device not found" };

    if (req.user.orgId !== foundDevice.owner_id) {
      return {
        success: false,
        message: "The device does not belong to your organization",
      };
    }
    return { success: true, message: "Allowed" };
  } catch (error) {
    return { success: false, message: error };
  }
};

exports.hasOwnUserInformationAccess = async (
  req,
  requestedUserId,
  requiredRoleRights = null,
) => {
  try {
    if (!req.user) return { success: false, message: "Token not provided" };

    let role = req.user.role ? await getRoleByTitle(req.user.role.title) : null;

    if (role && role.dataValues) role = role.dataValues;

    if (!role) return { success: false, message: "Role not found" };

    if (role.super || role.admin) return { success: true, message: "Allowed" };

    if (req.user.id !== Number(requestedUserId)) {
      return { success: false, message: "You are not allowed" };
    }

    if (requiredRoleRights) {
      const hasRequiredRoleRights = this.hasProvidedRoleRights(
        role,
        requiredRoleRights,
      );
      if (!hasRequiredRoleRights.success) {
        return {
          success: false,
          message: "Unauthorized to perform the action",
        };
      }
    }

    return { success: true, message: "Allowed" };
  } catch (error) {
    return { success: false, message: error };
  }
};

exports.hasOwnOrganizationalUserInformationAccess = async (
  req,
  requestedUserId,
  requiredRoleRights = null,
) => {
  try {
    if (!req.user) return { success: false, message: "Token not provided" };

    const role = req.user.role
      ? await getRoleByTitle(req.user.role.title)
      : null;
    if (!role) return { success: false, message: "Role not found" };
    if (role.super || role.admin) return { success: true, message: "Allowed" };

    const foundUser = await UserModel.findById(requestedUserId);
    if (!foundUser) return { success: false, message: "User not found" };

    if (req.user.orgId !== Number(foundUser.orgId)) {
      return { success: false, message: "You are not allowed" };
    }

    if (requiredRoleRights) {
      const hasRequiredRoleRights = this.hasProvidedRoleRights(
        role,
        requiredRoleRights,
      );
      if (!hasRequiredRoleRights.success) {
        return {
          success: false,
          message: "Unauthorized to perform the action",
        };
      }
    }
    return { success: true, message: "Allowed" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

exports.formatIdsRegexForInfluxQueries = (string) => {
  const arrayOfIds = string.split("|").map((id) => `^${id}$`);
  return arrayOfIds.join("|");
};
exports.getTimeZoneOfDevice = (settings) => {
  let timezone = config.timeZone;
  try {
    const deviceSettings = JSON.parse(settings.dataValues.settings);
    if (deviceSettings.timezone_name) {
      if (deviceSettings.timezone_name === "Asia/karachi")
        timezone = "Asia/Tashkent";
      else timezone = deviceSettings.timezone_name;
    }
  } catch (error) {
    logger.error(error);
  }
  return timezone;
};
exports.isRoleIncluded = (req, roles = []) => {
  if (!roles.length) return true;

  const userData = req.user;
  return roles.includes(userData.role.title);
};

exports.schemasPerDeviceType = Object.freeze({
  1: {
    alertsSchema: automaAlertsSchema,
    alertsData: automaAlertsData,
    alertsInfluxSchema: automaAlertsInfluxSchema,
  },
});

exports.getAlertsCategoriesAndIndications = () => {
  const alertsCategoriesDetails = alertsCategories.alertCategories;
  const alertsCategoriesIndications = Object.assign(
    {},
    ...alertsCategoriesDetails.map((cat) => ({
      [cat.indicationField]: false,
    })),
  );
  return { alertsCategoriesDetails, alertsCategoriesIndications };
};

exports.fetch = async (url) => {
  const { data } = await axios.get(url, { responseType: "arraybuffer" });
  return data;
};

exports.resourceAccessControl = (
  user,
  resourceId,
  orgId,
  requiredRights,
  options,
) => {
  const defaultOptions = {
    selfResourceId: user.id, // Resource Id that overrides default user id
    nonOrgAllowedRight: ["super", "admin"], // Allowed Nonorganization users allowed
    cb: () => {
      return true;
    }, // Call back that returns true or false based on logical expressions to chain with same org resources check
  };
  options = { ...defaultOptions, ...options };
  const isSelf = Number(options.selfResourceId) === Number(resourceId);
  const isPrivelagedUser = this.hasProvidedRoleRights(
    user.role,
    options.nonOrgAllowedRight,
  ).success;
  const isListingOwnOrgResourceWithRoleRights =
    this.hasProvidedRoleRights(user.role, requiredRights).success &&
    user.orgId === orgId &&
    options.cb();
  if (isSelf || isPrivelagedUser || isListingOwnOrgResourceWithRoleRights)
    return true;
  return false;
};

exports.validateDataWithSchema = (schema, data) => {
  const compiledSchema = ajv.compile(schema);
  const validateSchema = compiledSchema(data);
  return {
    isValidated: validateSchema,
    errors: compiledSchema.errors || null,
  };
};

exports.delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

exports.flattenObject = (obj, parent, res = {}) => {
  for (const key in obj) {
    const propName = parent ? parent + "." + key : key;
    if (typeof obj[key] == "object") {
      this.flattenObject(obj[key], propName, res);
    } else {
      res[propName] = obj[key];
    }
  }
  return res;
};

exports.isURL = (string) => {
  try {
    return Boolean(new URL(string));
  } catch (_) {
    return false;
  }
};

exports.getURLOfImages = (imagesArray) => {
  const updatedImages = [];
  imagesArray.forEach((img) => {
    if (!this.isURL(img)) updatedImages.push(getFileURL(img));
    else updatedImages.push(img);
  });
  return updatedImages;
};

exports.moment = moment;

exports.formatIdsRegexForInfluxQueries = (pipeSeparatedIds) => {
  const arrayOfIds = pipeSeparatedIds.split("|").map((id) => `^${id}$`);
  return arrayOfIds.join("|");
};

exports.objectValuesToString = (object, keys = []) => {
  const convertAllToString = !keys.length;
  const clonedObject = cloneDeep(object);

  const allKeys = Object.keys(clonedObject);

  let keysToConvert = allKeys;

  if (!convertAllToString) {
    keysToConvert = allKeys.filter((key) => keys.includes(key));
  }

  keysToConvert.forEach((key) => {
    let value = clonedObject[key];

    if (typeof value === "object") {
      value = JSON.stringify(value);
    } else {
      value = String(value);
    }

    clonedObject[key] = value;
  });

  return clonedObject;
};

exports.objectValuesToNumber = (
  object = {},
  keys = [],
  convertOnlyBoolean = false,
) => {
  const clonedObject = { ...object };

  const allKeys = Object.keys(clonedObject);

  let keysToConvert = allKeys;

  if (keys.length) {
    keysToConvert = allKeys.filter((key) => keys.includes(key));
  }

  if (convertOnlyBoolean) {
    keysToConvert = allKeys.filter(
      (key) => typeof clonedObject[key] === "boolean",
    );
  }

  keysToConvert.forEach((key) => {
    let value = clonedObject[key];
    const numberValue = Number(value);

    if (value === null || Number.isNaN(numberValue)) {
      clonedObject[key] = value;
    } else {
      clonedObject[key] = numberValue;
    }
  });

  return clonedObject;
};

exports.getKeysWithChangedValues = (
  pickFromObject,
  toCompareWithObject,
  keysToExclude = [],
) => {
  // The function is responsible for comparing the 2 objects and returning the list of keys that have changed values.
  // Default parameter: keysToExclude represents the list of keys that have to be excluded from the returned list.

  return pickBy(pickFromObject, (value, key) => {
    return toCompareWithObject[key] != value && !keysToExclude.includes(key);
  });
};
