// External Module Imports
const Validator = require("validatorjs");
const path = require("node:path");

const apiResponse = require("../../../common/api.response");

const gameServices = require("../../../services/mobile/game");
const userGameInvitationServices = require("../../../services/mobile/user-game-invitations");
const userServices = require("../../../services/user");

const { validateObject, PhoneRegex } = require("../../../common/helper");
const helper = require("../../../common/helper");

const ServiceError = require("../../../utils/serviceError");
const {
  roleWithAuthorities,
} = require("../../../common/roles_with_authorities");
const config = require("../../../config/config");
const { uuid } = require("uuidv4");
const holeServices = require("../../../services/mobile/hole");
const { validationsForUpdateStatus } = require("./helper");

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
   *     summary: create or invite a user in a particular game
   *     description: |
   *              - This API can be used to either add the anonymous player or invite a player using the phone no.
   *              - If only name is used in the body then a new anonymous player would be added in the game without any invitation.
   *              - If the phone is provided then it will create the user if it does not already exist and then send the invitation to the specified phone.
   *     tags: [User Game Invitations]
   *     consumes:
   *       - application/json
   *     parameters:
   *       - in: body
   *         name: body
   *         schema:
   *          type: object
   *           - gameId
   *           - name
   *          required:
   *           - phone
   *          properties:
   *            phone:
   *              type: string
   *              example: +1NNNNNNNNNN
   *            gameId:
   *              type: string
   *              example: 4f5d4515-ebbd-4209-b6a3-8541621878d5
   *            name:
   *              type: string
   *              example: Kamran
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      phone: `regex:${PhoneRegex}`,
      gameId: "required|string",
      name: "string",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    if (!req.body.name && !req.body.phone) {
      throw new ServiceError(
        "The phone number and name can not be undefined at the same time",
        400,
      );
    }

    const filteredBody = validateObject(req.body, ["phone", "gameId", "name"]);

    const loggedInUserId = req.user.id;
    const game = await gameServices.isGameOwner(
      loggedInUserId,
      filteredBody.gameId,
    );
    if (!game) {
      throw new ServiceError("Only game owner can invite the user", 403);
    }

    await gameServices.validateMaxLimitOfPlayersPerGame(game.gameId);

    const isAnonymousPlayer = !filteredBody.phone && filteredBody.name;
    const user = await userServices.create_user(
      {
        email: `${filteredBody.phone || uuid()}@phonenumber.com`,
        role_id: roleWithAuthorities.golfer.id,
        phone: filteredBody.phone,
        name: filteredBody.name || "",
      },
      isAnonymousPlayer,
    );

    const mqtt = {};
    let response;
    if (isAnonymousPlayer) {
      const anonymousPlayerGameData = validateObject(game.dataValues, [
        "ownerId",
        "orgId",
        "gcId",
        "startTime",
        "teeColor",
        "gameId",
        "totalIdealShots",
      ]);
      anonymousPlayerGameData.participantId = user.id;
      anonymousPlayerGameData.participantName = user.name;

      response = await gameServices.createGame(anonymousPlayerGameData);

      const holes = await holeServices.getHolesByWhere(
        { gId: game.id },
        { attributes: ["par", "holeNumber", "holeId"] },
      );
      await holeServices.createGameHoles(
        holes,
        user.id,
        response.id,
        game.gameId,
        game.gcId,
      );
      mqtt.channel = `game/${game.gameId}/screens`;
      mqtt.message = {
        action: "scorecard",
      };
    } else {
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

      const appStoreLink = new URL(
        path.normalize(
          config.app.backendURL + config.app.apiPath + config.mobileApp.link,
        ),
      ).toString();
      const golfCourse = game.Golf_Course.name;
      const invitedByName = userGameInvitation.Invited_By.name;

      const message = `Your friend ${
        invitedByName ? invitedByName.toUpperCase() : ""
      } has invited you to play in ${golfCourse}. Please click on the link below:\n${appStoreLink}`;

      await helper.send_sms(filteredBody.phone, message);
      mqtt.channel = `u/${userGameInvitation.userId}/data`;
      mqtt.message = { action: "invitations" };
      response = userGameInvitation;
    }
    helper.mqtt_publish_message(mqtt.channel, mqtt.message, false);
    return apiResponse.success(res, req, response);
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
      await userGameInvitationServices.getUnAttendedUserGameInvitationsByUserId(
        loggedInUserId,
      );
    return apiResponse.success(res, req, invitations);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.updateInvitations = async (req, res) => {
  /**
   * @swagger
   *
   * /user-game-invitations:
   *   put:
   *     security:
   *       - auth: []
   *     summary: Update single or multiple invites
   *     description: |
   *              - This API can be used to mark all invites as "invalid", "declined", "seen", "ignored", if status is specified using "statusForMultipleInvitations" query param.
   *                - Note: "accepted" status can not be passed in "statusForMultipleInvitations"
   *                - If ids are specified in the body using "invitationIds" as the key in comma separated string format then only corresponding invites are going to be updated
   *                - Keep in mind that if same invitation id is passed using "invitationId" as well as "invitationIds" then the status under "statusForSingleInvitation" would get precedence
   *                  - Example:
   *                    Body -> invitationId: 1, invitationIds: "1"
   *                    Query -> statusForSingleInvitation: "accepted", statusForMultipleInvitations: "declined"
   *                    In this example, the invitation corresponding to id 1 would get "accepted" status instead of "declined".
   *              - This API can also be used to mark single invite as "accepted", "declined" etc if status is specified using "statusForSingleInvitation" and "invitationId" is set in the body.
   *     tags: [User Game Invitations]
   *     consumes:
   *       - application/json
   *     parameters:
   *       - in: body
   *         name: body
   *         schema:
   *          type: object
   *          properties:
   *            statusForSingleInvitation:
   *              type: string
   *              example: accepted
   *            statusForMultipleInvitations:
   *              type: string
   *              example: declined
   *       - in: query
   *         name: invitationId
   *         type: integer
   *       - in: query
   *         name: invitationIds
   *         type: string
   *         description: comma separated ids - "1,2,3,5,6"
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const bodyValidation = new Validator(req.body, {
      statusForSingleInvitation: "in:accepted,declined,ignored,seen",
      statusForMultipleInvitations: "in:ignored,declined,seen,invalid",
    });

    const queryValidation = new Validator(req.query, {
      invitationId: "integer",
      invitationIds: "string",
    });

    if (bodyValidation.fails()) {
      return apiResponse.fail(res, bodyValidation.errors);
    }

    if (queryValidation.fails()) {
      return apiResponse.fail(res, queryValidation.errors);
    }

    const loggedInUserId = req.user.id;
    const { invitationId, invitationIds } = req.query;
    const { statusForSingleInvitation, statusForMultipleInvitations } =
      req.body;

    let uniqueInvitationIds = [];
    if (invitationIds) uniqueInvitationIds = invitationIds.split(",");
    uniqueInvitationIds = Array.from(new Set(uniqueInvitationIds)).filter(
      (id) => id != invitationId && Number(id),
    );

    validationsForUpdateStatus(
      invitationId,
      statusForSingleInvitation,
      uniqueInvitationIds,
      statusForMultipleInvitations,
    );

    let noOfAffectedRowsForSingleInvitation = 0;

    // update multiple invitations
    const noOfAffectedRowsForMultipleInvitation =
      await userGameInvitationServices.updateInvitationsWithASingleStatus(
        loggedInUserId,
        statusForMultipleInvitations,
        uniqueInvitationIds,
      );

    // update status of a single invitation
    if (invitationId) {
      // Logic for updating the single invitation
      let invitation =
        await userGameInvitationServices.getOneUserGameInvitation({
          id: invitationId,
          userId: loggedInUserId,
        });

      if (invitation) {
        const game = await gameServices.getOneGame({
          gameId: invitation.gameId,
          ownerId: invitation.invitedBy,
        });

        if (statusForSingleInvitation == "accepted") {
          await gameServices.validateMaxLimitOfPlayersPerGame(game.gameId);
          if (game.endTime) {
            throw new ServiceError("The game has already ended", 400);
          }
        }

        noOfAffectedRowsForSingleInvitation =
          await userGameInvitationServices.updateInvitationById(
            statusForSingleInvitation,
            invitation.id,
          );

        if (
          noOfAffectedRowsForSingleInvitation &&
          statusForSingleInvitation == "accepted"
        ) {
          await gameServices.createGameForInvitedUser(
            game.dataValues,
            loggedInUserId,
          );
          helper.mqtt_publish_message(
            `game/${invitation.gameId}/screens`,
            { action: "scorecard" },
            false,
          );
        }

        if (
          noOfAffectedRowsForSingleInvitation &&
          statusForSingleInvitation == "declined"
        ) {
          helper.mqtt_publish_message(`game/users/${invitation.invitedBy}`, {
            action: "invite-decline",
            user: invitation.userId,
          });
        }
      }
    }

    if (
      !noOfAffectedRowsForSingleInvitation &&
      !noOfAffectedRowsForMultipleInvitation
    ) {
      throw new ServiceError("Failed to update the invitation/s", 404);
    }

    const totalUpdatedRecords =
      noOfAffectedRowsForMultipleInvitation +
      noOfAffectedRowsForSingleInvitation;
    const response = `${totalUpdatedRecords} invitation${
      totalUpdatedRecords > 1 ? "s" : ""
    } updated successfully`;
    return apiResponse.success(res, req, response);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
