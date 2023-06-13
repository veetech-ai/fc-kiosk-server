const { getFileURL } = require("../../common/upload");
const { User_Game_Invitation } = require("../../models");
const models = require("../../models");

const { Op } = require("sequelize");
const ServiceError = require("../../utils/serviceError");

const typesOfUpdatableInvitations = ["seen", "ignored", "pending"];
exports.createUserGameInvitations = async (body) => {
  let invitation;
  invitation = await this.getOneUserGameInvitation({
    userId: body.userId,
    gameId: body.gameId,
  });

  if (!invitation) {
    invitation = await User_Game_Invitation.create(body);
  } else if (invitation && invitation.status == "declined") {
    await models.User_Game_Invitation.update(
      {
        status: "pending",
        createdAt: new Date(),
      },
      {
        where: {
          id: invitation.id,
        },
      },
    );
  }

  // Calling this service again because the created invite does not have the invited by name
  return await this.getOneUserGameInvitation({ id: invitation.id });
};

exports.getOneUserGameInvitation = async (where) => {
  const invitation = await User_Game_Invitation.findOne({
    where,
    include: [
      {
        model: models.User,
        as: "Invited_By",
        attributes: ["name"],
      },
      {
        model: models.User,
        as: "Participant",
        attributes: ["name"],
      },
    ],
  });

  return invitation;
};

exports.getUnAttendedUserGameInvitationsByUserId = async (userId) => {
  const userGameInvitations = await User_Game_Invitation.findAll({
    where: {
      userId,
      status: {
        [Op.in]: typesOfUpdatableInvitations,
      },
    },
    order: [["id", "DESC"]],
    include: [
      {
        model: models.Mobile_Course,
        as: "Golf_Course",
        attributes: ["name"],
      },
      {
        model: models.User,
        as: "Invited_By",
        attributes: ["name", "profile_image"],
      },
    ],
  });
  for (const invitation of userGameInvitations) {
    invitation.Invited_By.profile_image = getFileURL(
      invitation.dataValues.Invited_By.profile_image,
    );
  }

  return userGameInvitations;
};

exports.updateInvitationsWithASingleStatus = async (
  userId,
  status,
  ids = [],
) => {
  let noOfAffectedRows = 0;
  if (!status || status == "accepted") return noOfAffectedRows;

  const where = {
    status: {
      [Op.in]: typesOfUpdatableInvitations,
    },
    userId,
  };

  if (ids && ids.length > 0) {
    where.id = {
      [Op.in]: ids,
    };
  }

  const response = await User_Game_Invitation.update(
    {
      status,
    },
    {
      where,
    },
  );

  noOfAffectedRows = response[0];
  return noOfAffectedRows;
};

exports.updateInvitationById = async (status, id) => {
  const response = await User_Game_Invitation.update(
    {
      status,
    },
    {
      where: {
        id,
        status: {
          [Op.in]: typesOfUpdatableInvitations,
        },
      },
    },
  );

  const noOfAffectedRows = response[0];
  return noOfAffectedRows;
};
exports.invalidAllUnAcceptedInvitations = async (gameId) => {
  return await User_Game_Invitation.update(
    {
      status: "invalid",
    },
    {
      where: {
        gameId,
        status: {
          [Op.in]: typesOfUpdatableInvitations,
        },
      },
    },
  );
};

exports.deletePlayerInvitationsForAParticularGame = async (userId, gameId) => {
  const noOfAffectedRows = await User_Game_Invitation.destroy({
    where: {
      userId,
      gameId,
    },
  });

  return noOfAffectedRows;
};

exports.deleteUserGameInvitationsWhere = async (where) => {
  return await User_Game_Invitation.destroy({
    where,
  });
};
