module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Courses", "golfbert_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Courses", "golfbert_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      unique: false,
    });
  },
};
