module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "Ad_screens",
      [
        {
          id: 1,
          name: "All",
        },
        {
          id: 2,
          name: "Main",
        },
      ],
      {
        updateOnDuplicate: ["name"],
      },
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Ad_screens", {
      id: [1, 2], 
    });
  },
};
