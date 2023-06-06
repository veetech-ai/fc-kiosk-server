"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const screensData = [{ name: "Scorecard" }, { name: "Add player" }];

    for (let i = 1; i <= 18; i++) {
      const screen = {
        name: `Hole ${i}`,
      };

      screensData.push(screen);
    }

    await queryInterface.bulkInsert("Ad_screens", screensData, {
      updateOnDuplicate: ["name"],
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Ad_screens", null, {});
  },
};
