const { Club } = require("../../models");
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
      exclude: ["userId", "id"],
    },
  });

  if (!club) throw new ServiceError("No club associated with the user", 404);
  return club;
};

exports.deleteClubs = async (where) => {
  const noOfAffectedRows = await Club.destroy({ where });
  return noOfAffectedRows;
};

exports.updateClubs = async function (userId, updates) {
  let result;

  // Find the user's clubs
  const existingClubs = await Club.findOne({
    where: {
      userId,
    },
  });

  if (!existingClubs) {
    // No clubs found for the user, create the clubs
    const newUserClubs = {
      userId,
      ...updates,
    };

    result = await Club.create(newUserClubs);
  } else {
    // Update the existing clubs
    result = await Club.update(updates, {
      where: {
        userId,
      },
    });
  }
  return result;
};
