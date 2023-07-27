"use strict";

/** @type {import('sequelize').QueryInterface} */
module.exports = {
  async up(queryInterface) {
    const ads = await queryInterface.sequelize.query(
      "SELECT id, gcId, screens FROM Ads",
    );

    if (!ads.length || !ads[0].length) return;

    // for some reason sequelize or mysql is grouping results in sub arrays
    // thats why we new to flatten the array
    const courseAdsData = ads.flat().map((ad) => ({
      gcId: ad.gcId,
      adId: ad.id,
      screens: JSON.stringify(ad.screens),
    }));
    await queryInterface.bulkInsert("Course_Ads", courseAdsData, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Course_Ads", null, {});
  },
};

// module.exports = {
//   async up(queryInterface) {
//     await queryInterface.sequelize.query(`
//       INSERT INTO Course_Ads (gcId, screens)
//       SELECT gcId, screens
//       FROM Ads;
//     `);
//   },

//   async down(queryInterface) {
//     await queryInterface.sequelize.query("DELETE FROM Course_Ads;");
//   },
// };
