"use strict";

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      name: DataTypes.STRING,
      first_name: {
        type: DataTypes.VIRTUAL,
        get() {
          if (this.getDataValue("name")) {
            let name = this.getDataValue("name");
            if (name.indexOf(" ") >= 0) {
              name = name.split(" ");
              return name[0].trim();
            } else {
              return name;
            }
          } else {
            return "";
          }
        },
      },
      last_name: {
        type: DataTypes.VIRTUAL,
        get() {
          if (this.getDataValue("name")) {
            let name = this.getDataValue("name");
            if (name.indexOf(" ") >= 0) {
              name = name.split(" ");
              name.shift();
              const fname = name.join(" ");
              return fname.trim();
            } else {
              return "";
            }
          } else {
            return "";
          }
        },
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
      },
      handicapIndex: {
        field: "handicap_index",
        type: DataTypes.FLOAT,
      },
      profile_image: DataTypes.STRING,
      gender: DataTypes.STRING,
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        field: "date_of_birth",
      },
      phone: DataTypes.STRING,
      password: DataTypes.STRING,
      password_token: DataTypes.STRING,
      email_token: DataTypes.STRING,
      is_admin: DataTypes.BOOLEAN,
      status: DataTypes.INTEGER,
      advance_user: DataTypes.BOOLEAN,
      mqtt_token: DataTypes.STRING,
      super_admin: DataTypes.BOOLEAN,
      pn_status: DataTypes.BOOLEAN,
      phone_code: DataTypes.STRING,
      phone_verified: DataTypes.BOOLEAN,
      fb_id: DataTypes.STRING,
      g_id: DataTypes.STRING,
      tw_id: DataTypes.STRING,
      email_code: DataTypes.STRING,
      orgId: DataTypes.INTEGER,
      cardSerial: {
        type: DataTypes.STRING,
        field: "card_serial",
      },
      roleId: {
        type: DataTypes.STRING,
        field: "role_id",
      },
      reportTo: {
        type: DataTypes.INTEGER,
        field: "report_to",
      },
    },
    {
      defaultScope: {
        attributes: {
          exclude: ["password", "password_token", "email_token"],
        },
      },
    },
  );
  User.associate = function (models) {
    // models.User.hasMany(models.User_Device, { as: 'User_Devices', foreignKey: 'user_id' })
    models.User.belongsTo(models.Organization, {
      as: "Organization",
      foreignKey: "orgId",
      sourceKey: "id",
    });
    models.User.belongsTo(models.Role, {
      as: "Role",
      foreignKey: "role_id",
      sourceKey: "id",
    });
    models.User.hasMany(models.Push_Notifications_Subscriptions, {
      as: "PN_Subscriptions",
      foreignKey: "user_id",
    });
    models.User.hasOne(models.User_Settings, {
      as: "User_Settings",
      foreignKey: "user_id",
    });
    models.User.hasMany(models.User_Addresses, {
      as: "Addresses",
      foreignKey: "user_id",
    });
    User.hasMany(models.Hole, {
      as: "Holes",
      foreignKey: "user_id",
    });
    User.hasOne(models.Club, {
      as: "Club",
      foreignKey: "userId",
    });
  };
  return User;
};
