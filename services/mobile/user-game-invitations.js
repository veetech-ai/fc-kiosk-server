const { User_Game_Invitation } = require("../../models");
const models = require("../../models");

exports.createUserGameInvitations = async (body) => {
  const existingInvitation = await this.getOneInvitation({
    userId: body.userId,
    gameId: body.gameId,
  });
  if (existingInvitation) return existingInvitation;

  const newCreatedInvitation = await User_Game_Invitation.create(body);

  // Calling this service again because the created invite does not have the invited by name
  return await this.getOneInvitation({ id: newCreatedInvitation.id });
};

exports.getOneInvitation = async (where) => {
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
