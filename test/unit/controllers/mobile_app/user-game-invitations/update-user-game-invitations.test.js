const helper = require("../../../../helper");
const mainHelper = require("../../../../../common/helper");

const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const {
  deleteUserGameInvitationsWhere,
  updateInvitationById,
  getOneUserGameInvitation,
} = require("../../../../../services/mobile/user-game-invitations");
const {
  updateGameIfGameIdIsValid,
  deleteGames,
} = require("../../../../../services/mobile/game");
const { deleteUsers } = require("../../../../../services/user");
const nonExistingPhoneNo = "+923345233206";

describe("POST: /games", () => {
  let superAdminToken;
  let gameOwnerToken;
  let gameOwnerData;
  let invitedPlayerToken;
  let invitedPlayerData;
  const golfCourseId = 1;
  const gameCreationBody = {
    teeColor: "Red",
    holes: [
      {
        holeId: 31931,
        holeNumber: 1,
        par: 4,
      },
    ],
    gcId: golfCourseId,
  };
  const gameIds = [];
  const makeCreateGameApiRequest = async (params, token) => {
    return await helper.post_request_with_authorization({
      endpoint: "games",
      token: token,
      startTime: new Date(),
      params: params,
    });
  };

  const invitePlayerOrAddAnonymousPlayer = async (params) => {
    const invitation = await helper.post_request_with_authorization({
      endpoint: "user-game-invitations",
      token: gameOwnerToken,
      params,
    });
    return invitation;
  };

  const makeCreateUserGameInvitationApiRequest = async (
    statuses,
    phone = invitedPlayerData?.phone,
  ) => {
    const invitationsWithStatus = [];
    for await (const status of statuses) {
      const gameCreationResponse = await makeCreateGameApiRequest(
        { ...gameCreationBody, gameId: uuidv4(), startTime: new Date() },
        gameOwnerToken,
      );

      const invitationParams = {
        gameId: gameCreationResponse.body.data.gameId,
        phone,
      };
      const invitation = await invitePlayerOrAddAnonymousPlayer(
        invitationParams,
      );

      await updateInvitationById(status, invitation.body.data.id);
      invitationsWithStatus.push({
        status,
        id: invitation.body.data.id,
        gameId: gameCreationResponse.body.data.gameId,
      });
      gameIds.push(gameCreationResponse.body.data.gameId);
    }
    return invitationsWithStatus;
  };

  const makeUpdateUserGameInvitationApiRequest = async (
    body,
    queryParams,
    token,
  ) => {
    return await helper.put_request_with_authorization({
      endpoint: "user-game-invitations",
      token: token,
      params: body,
      queryParams: queryParams,
    });
  };

  jest.spyOn(mainHelper, "send_sms").mockImplementation(
    jest.fn((otpCode) => {
      return Promise.resolve(otpCode);
    }),
  );
  beforeAll(async () => {
    superAdminToken = await helper.get_token_for();

    gameOwnerToken = await helper.get_token_for("golfer");
    gameOwnerData = jwt.decode(gameOwnerToken);

    invitedPlayerToken = await helper.get_token_for("testGolfer");
    invitedPlayerData = jwt.decode(invitedPlayerToken);
  });

  afterAll(async () => {
    await deleteGames({});
    await deleteUsers({ phone: nonExistingPhoneNo });
    // await deleteUserGameInvitationsWhere({}, true)
  });

  describe("All test cases that do not involve invitation creation", () => {
    it("Should return 400 and validation error if invalid body is passed", async () => {
      const expectedResponse = {
        success: false,
        data: {
          errors: {
            statusForMultipleInvitations: [
              "The selected statusForMultipleInvitations is invalid.",
            ],
            statusForSingleInvitation: [
              "The selected statusForSingleInvitation is invalid.",
            ],
          },
        },
      };

      const body = {
        statusForSingleInvitation: "abc",
        statusForMultipleInvitations: "abc",
      };

      const gameInvitationResponse =
        await makeUpdateUserGameInvitationApiRequest(body, {}, gameOwnerToken);

      expect(gameInvitationResponse.body).toEqual(expectedResponse);
      expect(gameInvitationResponse.statusCode).toEqual(400);
    });

    it("Should return 400 and validation error if invalid query params values are passed", async () => {
      const expectedResponse = {
        success: false,
        data: {
          errors: {
            invitationId: ["The invitationId must be an integer."],
          },
        },
      };

      const queryParams = {
        invitationId: "abc",
      };

      const gameInvitationResponse =
        await makeUpdateUserGameInvitationApiRequest(
          {},
          queryParams,
          gameOwnerToken,
        );

      expect(gameInvitationResponse.body).toEqual(expectedResponse);
      expect(gameInvitationResponse.statusCode).toEqual(400);
    });

    it("Should return 400 and validation error if invitationId is passed but the statusForSingleInvitation is not passed", async () => {
      const expectedResponse = {
        success: false,
        data: "Please provide the valid status for the specified invitation id",
      };

      const queryParams = {
        invitationId: 1,
      };
      const gameInvitationResponse =
        await makeUpdateUserGameInvitationApiRequest(
          {},
          queryParams,
          gameOwnerToken,
        );

      expect(gameInvitationResponse.body).toEqual(expectedResponse);
      expect(gameInvitationResponse.statusCode).toEqual(400);
    });

    it("Should return 400 and validation error if statusForSingleInvitation is passed but the invitationId is not passed", async () => {
      const expectedResponse = {
        success: false,
        data: "Missing invitation id",
      };

      const body = {
        statusForSingleInvitation: "accepted",
      };
      const gameInvitationResponse =
        await makeUpdateUserGameInvitationApiRequest(body, {}, gameOwnerToken);

      expect(gameInvitationResponse.body).toEqual(expectedResponse);
      expect(gameInvitationResponse.statusCode).toEqual(400);
    });

    it("Should return 400 and validation error if invitationIds are passed but the statusForMultipleInvitations is not passed", async () => {
      const expectedResponse = {
        success: false,
        data: "Please provide the valid status for the specified invitation ids",
      };

      const queryParams = {
        invitationIds: "1,2",
      };

      const gameInvitationResponse =
        await makeUpdateUserGameInvitationApiRequest(
          {},
          queryParams,
          gameOwnerToken,
        );

      expect(gameInvitationResponse.body).toEqual(expectedResponse);
      expect(gameInvitationResponse.statusCode).toEqual(400);
    });

    it("Should return 404 if the player tries to update the single invitation that does not exist", async () => {
      const expectedResponse = {
        success: false,
        data: "Failed to update the invitation/s",
      };

      const queryParams = {
        invitationId: -1,
      };

      const body = {
        statusForSingleInvitation: "accepted",
      };
      const gameInvitationResponse =
        await makeUpdateUserGameInvitationApiRequest(
          body,
          queryParams,
          gameOwnerToken,
        );

      expect(gameInvitationResponse.body).toEqual(expectedResponse);
      expect(gameInvitationResponse.statusCode).toEqual(404);
    });
  });

  describe("All test cases that invloves the invitations creation", () => {
    beforeEach(async () => {
      await deleteUserGameInvitationsWhere({ userId: invitedPlayerData.id });
    });
    it("Should return 404 if the player tries to update the single invitation that does not belong to him/her", async () => {
      const expectedResponse = {
        success: false,
        data: "Failed to update the invitation/s",
      };

      // create the game and invite the player

      const statuses = ["pending"];
      const invitations = await makeCreateUserGameInvitationApiRequest(
        statuses,
        nonExistingPhoneNo,
      );

      // end the game
      // await updateGameIfGameIdIsValid({ gameId: invitations[0].gameId }, { endTime: new Date() })

      const queryParams = {
        invitationId: invitations[0].id,
      };

      const body = {
        statusForSingleInvitation: "accepted",
      };
      const gameInvitationResponse =
        await makeUpdateUserGameInvitationApiRequest(
          body,
          queryParams,
          invitedPlayerToken,
        );

      expect(gameInvitationResponse.body).toEqual(expectedResponse);
      expect(gameInvitationResponse.statusCode).toEqual(404);
    });

    it("Should return 400 if the player tries to update the single invitation of the game that is already ended", async () => {
      const expectedResponse = {
        success: false,
        data: "The game has already ended",
      };

      // create the game and invite the player

      const statuses = ["pending"];
      const invitations = await makeCreateUserGameInvitationApiRequest(
        statuses,
      );

      // end the game
      await updateGameIfGameIdIsValid(
        { gameId: invitations[0].gameId },
        { endTime: new Date() },
      );

      const queryParams = {
        invitationId: invitations[0].id,
      };

      const body = {
        statusForSingleInvitation: "accepted",
      };
      const gameInvitationResponse =
        await makeUpdateUserGameInvitationApiRequest(
          body,
          queryParams,
          invitedPlayerToken,
        );

      expect(gameInvitationResponse.body).toEqual(expectedResponse);
      expect(gameInvitationResponse.statusCode).toEqual(400);
    });

    it("Should return 400 if the invitation is already accepted, declined or invalid", async () => {
      const expectedResponse = {
        success: false,
        data: "Failed to update the invitation/s",
      };

      // create the game and invite the player

      const statuses = ["accepted", "declined", "invalid"];
      const invitations = await makeCreateUserGameInvitationApiRequest(
        statuses,
      );

      const body = {
        statusForSingleInvitation: "accepted",
      };

      for await (const invitation of invitations) {
        const gameInvitationResponse =
          await makeUpdateUserGameInvitationApiRequest(
            body,
            { invitationId: invitation.id },
            invitedPlayerToken,
          );
        expect(gameInvitationResponse.body).toEqual(expectedResponse);
        expect(gameInvitationResponse.statusCode).toEqual(404);
      }
    });

    it("Should decline the single pending invitation successfully", async () => {
      const expectedResponse = {
        success: true,
        data: "1 invitation updated successfully",
      };

      // create the game and invite the player

      const statuses = ["pending"];
      const invitations = await makeCreateUserGameInvitationApiRequest(
        statuses,
      );

      const body = {
        statusForSingleInvitation: "declined",
      };
      const mqttPublishMessageSpy = jest.spyOn(
        mainHelper,
        "mqtt_publish_message",
      );
      mqttPublishMessageSpy.mockReset();
      const gameInvitationResponse =
        await makeUpdateUserGameInvitationApiRequest(
          body,
          { invitationId: invitations[0].id },
          invitedPlayerToken,
        );
      expect(gameInvitationResponse.body).toEqual(expectedResponse);
      expect(mqttPublishMessageSpy).not.toHaveBeenCalledWith(
        `game/${invitations[0].id}/screens`,
        { action: "scorecard" },
        false,
      );
      expect(mqttPublishMessageSpy).toHaveBeenCalledWith(
        `game/${invitations[0].gameId}/users/${gameOwnerData.id}`,
        {
          action: "invite-decline",
          userId: invitedPlayerData.id,
        },
      );
      expect(gameInvitationResponse.statusCode).toEqual(200);
      mqttPublishMessageSpy.mockRestore();
    });

    it("Should accept the single pending invitation and send the mqtt message successully", async () => {
      const expectedResponse = {
        success: true,
        data: "1 invitation updated successfully",
      };

      // create the game and invite the player

      const statuses = ["pending"];
      const invitations = await makeCreateUserGameInvitationApiRequest(
        statuses,
      );

      const body = {
        statusForSingleInvitation: "accepted",
      };
      const mqttPublishMessageSpy = jest.spyOn(
        mainHelper,
        "mqtt_publish_message",
      );
      mqttPublishMessageSpy.mockReset();
      mqttPublishMessageSpy.mockImplementation(
        (channel, message, retained = true, qos = 1, stringify = true) => {
          const expectedResponse = {
            channel: `game/${invitations[0].gameId}/screens`,
            message: {
              action: "scorecard",
            },
            retained: false,
            qos: 1,
            stringify: true,
          };
          expect({ channel, message, retained, qos, stringify }).toEqual(
            expectedResponse,
          );
        },
      );

      const gameInvitationResponse =
        await makeUpdateUserGameInvitationApiRequest(
          body,
          { invitationId: invitations[0].id },
          invitedPlayerToken,
        );

      expect(gameInvitationResponse.body).toEqual(expectedResponse);
      expect(mqttPublishMessageSpy).toHaveBeenCalled();
      expect(gameInvitationResponse.statusCode).toEqual(200);
      mqttPublishMessageSpy.mockRestore();
    });

    it("Should prefer the single invitation update status if same invitation id is passed as single as well as multiple invitations update with different statuses", async () => {
      const expectedResponse = {
        success: true,
        data: "1 invitation updated successfully",
      };

      // create the game and invite the player

      const statuses = ["pending"];
      const invitations = await makeCreateUserGameInvitationApiRequest(
        statuses,
      );

      const body = {
        statusForSingleInvitation: "seen",
        statusForMultipleInvitation: "declined",
      };

      const queryParams = {
        invitationId: invitations[0].id,
        invitationIds: `${invitations[0].id}`,
      };
      const gameInvitationResponse =
        await makeUpdateUserGameInvitationApiRequest(
          body,
          queryParams,
          invitedPlayerToken,
        );

      const updatedInvitation = await getOneUserGameInvitation({
        id: invitations[0].id,
      });
      expect(gameInvitationResponse.body).toEqual(expectedResponse);
      expect(updatedInvitation.status).toEqual("seen");
      expect(gameInvitationResponse.statusCode).toEqual(200);
    });

    it("should mark all invitations as ignored if statusForMultipleInvitations is ignored and invidationIds are not passed", async () => {
      const expectedResponse = {
        success: true,
        data: "3 invitations updated successfully",
      };

      // create the game and invite the player

      const statuses = ["pending", "pending", "pending"];
      const invitations = await makeCreateUserGameInvitationApiRequest(
        statuses,
      );

      const body = {
        statusForMultipleInvitations: "ignored",
      };

      const queryParams = {
        invitationIds: `${invitations.map((i) => i.id).join(",")}`,
      };

      const gameInvitationResponse =
        await makeUpdateUserGameInvitationApiRequest(
          body,
          queryParams,
          invitedPlayerToken,
        );

      expect(gameInvitationResponse.body).toEqual(expectedResponse);
      expect(gameInvitationResponse.statusCode).toEqual(200);
      for await (const invitation of invitations) {
        const updatedInvitation = await getOneUserGameInvitation({
          id: invitation.id,
        });
        expect(updatedInvitation.status).toEqual("ignored");
      }
    });

    it("should accept the invitation corresponding to invitationId and mark the invitations corresponding to invitationIds as ignored", async () => {
      const expectedResponse = {
        success: true,
        data: "3 invitations updated successfully",
      };

      // create the game and invite the player

      const statuses = ["pending", "pending", "pending"];
      const invitations = await makeCreateUserGameInvitationApiRequest(
        statuses,
      );

      const body = {
        statusForSingleInvitation: "accepted",
        statusForMultipleInvitations: "ignored",
      };

      const queryParams = {
        invitationId: invitations[0].id,
        invitationIds: `${invitations.map((i) => i.id).join(",")}`,
      };

      const gameInvitationResponse =
        await makeUpdateUserGameInvitationApiRequest(
          body,
          queryParams,
          invitedPlayerToken,
        );

      expect(gameInvitationResponse.body).toEqual(expectedResponse);
      expect(gameInvitationResponse.statusCode).toEqual(200);
      const acceptedInvitation = await getOneUserGameInvitation({
        id: invitations[0].id,
      });
      expect(acceptedInvitation.status).toBe("accepted");
      for await (const invitation of invitations.slice(1)) {
        const updatedInvitation = await getOneUserGameInvitation({
          id: invitation.id,
        });
        expect(updatedInvitation.status).toEqual("ignored");
      }
    });

    it("should accept the invitation corresponding to invitationId and mark the invitations corresponding to invitationIds as ignored", async () => {
      const expectedResponse = {
        success: true,
        data: "3 invitations updated successfully",
      };

      // create the game and invite the player

      const statuses = ["pending", "pending", "pending"];
      const invitations = await makeCreateUserGameInvitationApiRequest(
        statuses,
      );

      const body = {
        statusForSingleInvitation: "accepted",
        statusForMultipleInvitations: "ignored",
      };

      const queryParams = {
        invitationId: invitations[0].id,
        invitationIds: `${invitations.map((i) => i.id).join(",")}`,
      };

      const gameInvitationResponse =
        await makeUpdateUserGameInvitationApiRequest(
          body,
          queryParams,
          invitedPlayerToken,
        );

      expect(gameInvitationResponse.body).toEqual(expectedResponse);
      expect(gameInvitationResponse.statusCode).toEqual(200);
      const acceptedInvitation = await getOneUserGameInvitation({
        id: invitations[0].id,
      });
      expect(acceptedInvitation.status).toBe("accepted");
      for await (const invitation of invitations.slice(1)) {
        const updatedInvitation = await getOneUserGameInvitation({
          id: invitation.id,
        });
        expect(updatedInvitation.status).toEqual("ignored");
      }
    });

    it("should mark all invitations as seen if statusForMultipleInvitations is set as seen and invitationId and invitationsIds both are not passed", async () => {
      const expectedResponse = {
        success: true,
        data: "3 invitations updated successfully",
      };

      // create the game and invite the player

      const statuses = ["pending", "pending", "pending"];
      const invitations = await makeCreateUserGameInvitationApiRequest(
        statuses,
      );

      const body = {
        statusForMultipleInvitations: "seen",
      };

      const gameInvitationResponse =
        await makeUpdateUserGameInvitationApiRequest(
          body,
          {},
          invitedPlayerToken,
        );

      expect(gameInvitationResponse.body).toEqual(expectedResponse);
      expect(gameInvitationResponse.statusCode).toEqual(200);
      for await (const invitation of invitations) {
        const updatedInvitation = await getOneUserGameInvitation({
          id: invitation.id,
        });
        expect(updatedInvitation.status).toEqual("seen");
      }
    });

    it("should return an error if statusForMultipleInvitations is set as 'accepted'", async () => {
      const expectedResponse = {
        success: false,
        data: {
          errors: {
            statusForMultipleInvitations: [
              "The selected statusForMultipleInvitations is invalid.",
            ],
          },
        },
      };

      // create the game and invite the player

      const statuses = ["pending", "pending"];
      await makeCreateUserGameInvitationApiRequest(statuses);

      const body = {
        statusForMultipleInvitations: "accepted",
      };

      const gameInvitationResponse =
        await makeUpdateUserGameInvitationApiRequest(
          body,
          {},
          invitedPlayerToken,
        );

      expect(gameInvitationResponse.body).toEqual(expectedResponse);
      expect(gameInvitationResponse.statusCode).toEqual(400);
    });

    it("should return an error if player tries accept the invitation but the max player limit reached for the specified game", async () => {
      const expectedResponse = {
        success: false,
        data: "Limit reached: Max 5 players are allowed in a single game",
      };

      // create the game and invite the player
      const statuses = ["pending"];
      const invitations = await makeCreateUserGameInvitationApiRequest(
        statuses,
      );

      for await (const index of [1, 2, 3, 4]) {
        // add 4 anonymous players
        await invitePlayerOrAddAnonymousPlayer({
          gameId: invitations[0].gameId,
          name: "Kamran" + index,
        });
      }

      const body = {
        statusForSingleInvitation: "accepted",
      };

      const queryParams = {
        invitationId: invitations[0].id,
      };
      const gameInvitationResponse =
        await makeUpdateUserGameInvitationApiRequest(
          body,
          queryParams,
          invitedPlayerToken,
        );

      expect(gameInvitationResponse.body).toEqual(expectedResponse);
      expect(gameInvitationResponse.statusCode).toEqual(400);
    });
  });
});
