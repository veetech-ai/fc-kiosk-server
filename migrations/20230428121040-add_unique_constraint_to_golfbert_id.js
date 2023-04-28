module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint("Courses", {
      fields: ["golfbert_id"],
      type: "unique",
      name: "unique_golfbert_id_constraint",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint("Courses", "unique_golfbert_id_constraint");
  },
};
