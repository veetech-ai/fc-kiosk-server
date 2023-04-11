"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Users", "orgId", {
      references: {
        model: {
          tableName: "Organizations",
        },
        key: "id",
      },
      type: Sequelize.INTEGER,
      allowNull: true,
      onUpdate: "NO ACTION",
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Users", "orgId");
  },
};
