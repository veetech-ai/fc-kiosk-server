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
  return await User_Game_Invitation.findAll({
    where: {
      userId,
      status: {
        [Op.in]: ["seen", "pending", "ignored"],
      },
    },
    order: [["id", "DESC"]],
  });
};
