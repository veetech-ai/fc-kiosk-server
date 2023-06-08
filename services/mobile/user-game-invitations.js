const { getFileURL } = require("../../common/upload");
const { User_Game_Invitation } = require("../../models");
const models = require("../../models");

const { Op } = require("sequelize");

exports.createUserGameInvitations = async (body) => {
  const existingInvitation = await this.getOneUserGameInvitation({
    userId: body.userId,
    gameId: body.gameId,
  });
  if (existingInvitation) return existingInvitation;

  const newCreatedInvitation = await User_Game_Invitation.create(body);

  // Calling this service again because the created invite does not have the invited by name
  return await this.getOneUserGameInvitation({ id: newCreatedInvitation.id });
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
    ],
  });

  return invitation;
};

exports.getUnAttendedUserGameInvitations = async (userId) => {
  const userGameInvitations = await User_Game_Invitation.findAll({
    where: {
      userId,
      status: {
        [Op.in]: ["seen", "pending", "ignored"],
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
