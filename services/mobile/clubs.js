const models = require("../../models/index");
const Club = models.Club;

const ServiceError = require("../../utils/serviceError");

exports.createClub = async function (body) {
  return await Club.create(body);
};

exports.getClubsByUserId = async (userId) => {
  const club = await Club.findOne({
    where: {
      userId,
    },
    attributes: {
      exclude: ["userId"],
    },
  });

  if (!club) throw new ServiceError("No club associated with the user", 404);
  return club;
};

exports.deleteClubs = async (where) => {
  const noOfAffectedRows = await Club.destroy({ where });
  return noOfAffectedRows;
};
