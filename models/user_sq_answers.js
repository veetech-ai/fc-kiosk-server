"use strict";
module.exports = (sequelize, DataTypes) => {
  const User_SQ_Answers = sequelize.define(
    "User_SQ_Answers",
    {
      user_id: DataTypes.INTEGER,
      question_id: DataTypes.INTEGER,
      answer: DataTypes.STRING,
      answer_number: DataTypes.INTEGER,
    },
    {},
  );
  User_SQ_Answers.associate = function (models) {
    models.User_SQ_Answers.belongsTo(models.Security_Questions, {
      as: "SQ",
      foreignKey: "question_id",
    });
  };
  return User_SQ_Answers;
};
