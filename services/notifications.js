const settings = require("../config/settings");
const moment = require("moment");
const models = require("../models");
const Notifications = models.Notifications;

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports.list = (req) => {
  return new Promise((resolve, reject) => {
    const limit = parseInt(settings.get("all_notifications_limit") || 50);
    const query = {
      where: { user_id: req.user.id },
      order: [["id", "DESC"]],
      limit: limit,
    };

    if (req.query.filter) {
      if (req.query.filter == "read") {
        query.where.read_at = { [Op.ne]: null };
      } else if (req.query.filter == "unread") {
        query.where.read_at = { [Op.eq]: null };
      }
    }
    if (req.query.page) {
      let page = parseInt(req.query.page);
      page = (page - 1) * limit;
      if (page < 0) {
        page = 0;
      }
      query.offset = parseInt(page);
    }

    Notifications.findAll(query)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports.list_by_where = (where, select = false) => {
  return new Promise((resolve, reject) => {
    Notifications.findAll({
      where: where,
      attributes: select || [
        "id",
        "notice",
        "misc",
        "type",
        "read_at",
        "user_id",
        "device_id",
      ],
      order: [["id", "DESC"]],
      limit: parseInt(settings.get("all_notifications_limit") || 50),
    })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports.list_unread = (req, select = false) => {
  return new Promise((resolve, reject) => {
    const query = {
      where: { user_id: req.user.id, read_at: null },
      attributes: select || [
        "id",
        "notice",
        "misc",
        "type",
        "read_at",
        "user_id",
        "device_id",
      ],
      limit: parseInt(settings.get("unread_notification_limit") || 12),
      order: [["id", "DESC"]],
    };
    if (req.query.page) {
      query.offset = parseInt(req.query.page);
    }

    Notifications.findAll(query)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

exports.findByID = (id) => {
  return new Promise((resolve, reject) => {
    Notifications.findOne({
      where: { id: id },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};

exports.create = (params) => {
  return new Promise((resolve, reject) => {
    Notifications.create(params)
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};

exports.update = (id, params) => {
  return new Promise((resolve, reject) => {
    Notifications.update(params, { where: { id: id } })
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject({ message: err.message });
      });
  });
};

exports.read_all = (user_id) => {
  return new Promise((resolve, reject) => {
    Notifications.update(
      { read_at: moment().utc() },
      { where: { user_id: user_id } },
    )
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject({ message: err.message });
      });
  });
};

exports.delete = (id, params) => {
  return new Promise((resolve, reject) => {
    Notifications.destroy({ where: { id: id } })
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};
