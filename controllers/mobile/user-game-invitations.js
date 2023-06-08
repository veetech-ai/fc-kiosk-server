// External Module Imports
const Validator = require("validatorjs");

const apiResponse = require("../../common/api.response");

const gameServices = require("../../services/mobile/game");
const userGameInvitationServices = require("../../services/mobile/user-game-invitations");
const userServices = require("../../services/user");

const { validateObject, PhoneRegex, send_sms } = require("../../common/helper");
const helper = require("../../common/helper");

const ServiceError = require("../../utils/serviceError");
const { roleWithAuthorities } = require("../../common/roles_with_authorities");
const { mobileAppLink } = require("../../config/config");

/**
 * @swagger
 * tags:
 *   name: User Game Invitations
 *   description: User Game Invitations API's
 */
exports.createUserGameInvitations = async (req, res) => {
  /**
   * @swagger
   *
   * /user-game-invitations:
   *   post:
   *     security:
   *       - auth: []
   *     summary: invite a user in a particular game
   *     description: logged In user can invite a user in a particular game
   *     tags: [User Game Invitations]
   *     consumes:
   *       - application/json
   *     parameters:
   *       - in: body
   *         name: body
   *         schema:
   *          type: object
   *          required:
   *           - phoneNo
   *           - gameId
   *          properties:
   *            phoneNo:
   *              type: string
   *              example: +1NNNNNNNNNN
   *            gameId:
   *              type: string
   *              example: 4f5d4515-ebbd-4209-b6a3-8541621878d5
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      phoneNo: ["required", `regex:${PhoneRegex}`],
      gameId: "required|string",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    const filteredBody = validateObject(req.body, ["phoneNo", "gameId"]);

    const loggedInUserId = req.user.id;
    const game = await gameServices.isGameOwner(
      loggedInUserId,
      filteredBody.gameId,
    );
    if (!game) {
      throw new ServiceError("Only game owner can invite the user", 403);
    }

    const user = await userServices.create_user({
      email: `${filteredBody.phoneNo}@phonenumber.com`,
      role_id: roleWithAuthorities.golfer.id,
      phone: filteredBody.phoneNo,
    });

    if (user.id == loggedInUserId) {
      throw new ServiceError("You can not invite yourself", 403);
    }

    const userGameInvitationBody = {
      ...filteredBody,
      userId: user.id,
      invitedBy: req.user.id,
      gcId: game.gcId,
      gameStartTime: game.startTime,
    };
    const userGameInvitation =
      await userGameInvitationServices.createUserGameInvitations(
        userGameInvitationBody,
      );

    const golfCourse = game.Golf_Course.name;
    const invitedByName = userGameInvitation.Invited_By.name;
    const message = `You friend${
      invitedByName ? " " + invitedByName.toUpperCase() + " " : " "
    }has invited you to play in ${golfCourse}. Please click on the link below:\n${mobileAppLink}`;

    await helper.send_sms(filteredBody.phoneNo, message);
    helper.mqtt_publish_message(
      `u/${userGameInvitation.userId}/data`,
      { action: "invitations" },
      false,
    );
    return apiResponse.success(res, req, userGameInvitation);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.getUserGameInvitations = async (req, res) => {
  /**
   * @swagger
   *
   * /user-game-invitations:
   *   get:
   *     security:
   *       - auth: []
   *     summary: get game invitations of a logged in user
   *     description: This API will retrieve the game invitations of the logged in user
   *     tags: [User Game Invitations]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const loggedInUserId = req.user.id;
    const invitations =
      await userGameInvitationServices.getUnAttendedUserGameInvitations(
        loggedInUserId,
      );
    return apiResponse.success(res, req, invitations);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
