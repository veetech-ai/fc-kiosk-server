"use strict";
module.exports = (sequelize, DataTypes) => {
  const Security_Questions = sequelize.define(
    "Security_Questions",
    {
      question: DataTypes.STRING,
      status: DataTypes.INTEGER,
    },
    {},
  );
  Security_Questions.associate = function (models) {
    // associations can be defined here
    models.Security_Questions.hasOne(models.User_SQ_Answers, {
      as: "SQ_Answers",
      foreignKey: "question_id",
    });
  };
  return Security_Questions;
};
