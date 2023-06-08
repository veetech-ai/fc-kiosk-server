"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "AboutUs",
      [
        {
          id: 1,
          content:
            "<p><strong>Digital Fairways </strong>provides golfers an all-in-one app to track their shots, yardages, and keep score on more than 12,000 golf courses throughout the United States.</p><br/><p>Included with every course is each holes par, yardage and an overhead view with dynamic shot tracking. You can also connect with up to four friends during your round of golf to track your live scores.</p> <br/><p>All Digital Fairways Member get access to 100% of our features for FREE.</p><p><br></p><br/><strong><p>Digital Fairways Features:</p></strong><br/><p>Access to more than <strong>12,000 </strong>golf courses throughout the United States</p><br/><p>Live scoring with upto <strong>4 friends</strong> during your round.</p><br/><p>Easy-to-use <strong>scorecard</strong> for yourself or up to 4 players.</p><br/><p>Every holes par, yardage and an adjustable<strong>&nbsp;overhead view.</strong></p><br/><p>Distances to the center of the green.</p><br/><p>Dynamic yardage and <strong>shot tracking</strong> for every hole.</p><br/><p>Zoom in on detailed <strong>satellite imager</strong>y of each hole.</p><br/><p>Track all play <strong>history</strong> and <strong>scorecards</strong></p>",
        },
      ],
      {
        updateOnDuplicate: ["content"],
      },
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("AboutUs", null, {});
  },
};
