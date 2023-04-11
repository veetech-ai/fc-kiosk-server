"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    const data_arr = [
      { question: "What was your childhood nickname?" },
      { question: "In what city did you meet your spouse/significant other?" },
      { question: "What is the name of your favorite childhood friend?" },
      { question: "What school did you attend for sixth grade?" },
      { question: "What was the name of your first stuffed animal?" },
      { question: "In what city or town did your mother and father meet?" },
      { question: "What was the last name of your third grade teacher?" },
      { question: "What is your maternal grandmother's maiden name?" },
      { question: "In what city or town was your first job?" },
      {
        question:
          "What is the name of the place your wedding reception was held?",
      },
    ];

    return queryInterface.bulkInsert("Security_Questions", data_arr, {
      updateOnDuplicate: ["question"],
    });
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  },
};
