const helper = require("../../../../helper");
const userServices = require("../../../../../services/user");
const mainHelper = require("../../../../../common/helper");

const jwt = require("jsonwebtoken");
const nonExistingPhoneNo = "+12021262192";
const { v4: uuidv4 } = require("uuid");
const models = require("../../../../../models/index");
const {
  deleteUserGameInvitationsWhere,
  getOneUserGameInvitation,
} = require("../../../../../services/mobile/user-game-invitations");
describe("POST: /games", () => {
  let firstGolferGameId;
  let secondGolferGameId;
  let superAdminToken;
  let firstGolferToken;
  let secondGolferToken;
  let firstGolferData;
  let secondGolferData;
  const golfCourseId = 1;
  const holes = [
    {
      holeId: 31931,
      holeNumber: 1,
      par: 4,
    },
  ];
  const makeCreateGameApiRequest = async (params, token) => {
    return await helper.post_request_with_authorization({
      endpoint: "games",
      token: token,
      startTime: new Date(),
      params: params,
    });
  };

  const makeCreateUserGameInvitationApiRequest = async (params, token) => {
    return await helper.post_request_with_authorization({
      endpoint: "user-game-invitations",
      token: token,
      params: params,
    });
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

    firstGolferToken = await helper.get_token_for("golfer");
    secondGolferToken = await helper.get_token_for("testGolfer");
    firstGolferData = jwt.decode(firstGolferToken);
    secondGolferData = jwt.decode(secondGolferToken);

    const gameCreationBody = {
      teeColor: "Red",
      holes,
      gcId: golfCourseId,
    };

    const firstGameResponse = await makeCreateGameApiRequest(
      { ...gameCreationBody, gameId: uuidv4(), startTime: new Date() },
      firstGolferToken,
    );
    const secondGameResponse = await makeCreateGameApiRequest(
      { ...gameCreationBody, gameId: uuidv4(), startTime: new Date() },
      secondGolferToken,
    );

    firstGolferGameId = firstGameResponse.body.data.gameId; // firstGolfer is the owner of the game
    secondGolferGameId = secondGameResponse.body.data.gameId; // secondGolfer is the owner of the game
  });

  afterAll(async () => {
    await models.Game.destroy({
      where: {
        gameId: firstGolferGameId,
      },
    });
    await models.Game.destroy({
      where: {
        gameId: secondGolferGameId,
      },
    });
    await models.User_Game_Invitation.destroy({
      where: {},
    });
  });

  it("Should return 400 and validation error because of invalid phoneNo and gameId", async () => {
    const expectedResponse = {
      success: false,
      data: {
        errors: {
          gameId: ["The gameId field is required."],
        },
      },
    };
    const gameInvitationResponse = await makeCreateUserGameInvitationApiRequest(
      {},
      firstGolferToken,
    );

    expect(gameInvitationResponse.body).toEqual(expectedResponse);
    expect(gameInvitationResponse.statusCode).toEqual(400);
  });
  it("Should return 400 and validation error because of invalid phoneNo and gameId", async () => {
    const expectedResponse = {
      success: false,
      data: {
        errors: {
          phone: ["The phone format is invalid."],
          gameId: ["The gameId must be a string."],
        },
      },
    };

    const params = {
      phone: "+123",
      gameId: 123,
    };
    const gameInvitationResponse = await makeCreateUserGameInvitationApiRequest(
      params,
      firstGolferToken,
    );

    expect(gameInvitationResponse.body).toEqual(expectedResponse);
    expect(gameInvitationResponse.statusCode).toEqual(400);
  });

  it("Should return 400 and validation error because of invalid phoneNo and gameId", async () => {
    const expectedResponse = {
      success: false,
      data: "The phone number and name can not be undefined at the same time",
    };
    const gameInvitationResponse = await makeCreateUserGameInvitationApiRequest(
      { gameId: firstGolferGameId },
      firstGolferToken,
    );

    expect(gameInvitationResponse.body).toEqual(expectedResponse);
    expect(gameInvitationResponse.statusCode).toEqual(400);
  });

  it("Should return an error if the golfer tries to invite a user in a game, he does not own", async () => {
    const expectedResponse = {
      success: false,
      data: "Only game owner can invite the user",
    };

    const params = {
      phone: secondGolferData.phone,
      gameId: secondGolferGameId,
    };
    const gameInvitationResponse = await makeCreateUserGameInvitationApiRequest(
      params,
      firstGolferToken,
    );

    expect(gameInvitationResponse.body).toEqual(expectedResponse);
    expect(gameInvitationResponse.statusCode).toEqual(403);
  });

  it("Should return an error if the golfer tries to invite him/herself", async () => {
    const expectedResponse = {
      success: false,
      data: "You can not invite yourself",
    };

    const params = {
      phone: firstGolferData.phone,
      gameId: firstGolferGameId,
    };
    const gameInvitationResponse = await makeCreateUserGameInvitationApiRequest(
      params,
      firstGolferToken,
    );

    expect(gameInvitationResponse.body).toEqual(expectedResponse);
    expect(gameInvitationResponse.statusCode).toEqual(403);
  });

  it("Should successfully create and invite the user if the user against the specified phone no does not exist", async () => {
    const mqttMessageSpy = jest
      .spyOn(mainHelper, "mqtt_publish_message")
      .mockImplementation(
        (channel, message, retained = true, qos = 1, stringify = true) => {
          expect({
            qos,
            stringify,
          }).toEqual({ qos: 1, stringify: true });
        },
      );
    const expectedResponse = {
      Invited_By: {
        name: "Golfer",
      },
      Participant: {
        name: "Player",
      },
      invitedBy: firstGolferData.id,
      gameId: firstGolferGameId,
      status: "pending",
      userId: expect.any(Number),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      id: expect.any(Number),
      gameStartTime: expect.any(String),
      gcId: golfCourseId,
    };
    const params = {
      phone: nonExistingPhoneNo,
      gameId: firstGolferGameId,
      name: "Player",
    };

    await deleteUserGameInvitationsWhere({});

    const gameInvitationResponse = await makeCreateUserGameInvitationApiRequest(
      params,
      firstGolferToken,
    );

    expect(gameInvitationResponse.body.data).toEqual(expectedResponse);
    expect(gameInvitationResponse.body.success).toBe(true);

    expect(gameInvitationResponse.statusCode).toBe(200);
    expect(mqttMessageSpy).toHaveBeenCalledWith(
      `u/${gameInvitationResponse.body.data.userId}/data`,
      { action: "invitations" },
      false,
    );
    mqttMessageSpy.mockRestore();
  });

  it("Should successfully create and invite the user even if the user already declined the previous invitation on the specified game", async () => {
    const mqttMessageSpy = jest
      .spyOn(mainHelper, "mqtt_publish_message")
      .mockImplementation(
        (channel, message, retained = true, qos = 1, stringify = true) => {
          expect({
            qos,
            stringify,
          }).toEqual({ qos: 1, stringify: true });
        },
      );
    const expectedResponse = {
      Invited_By: {
        name: "Golfer",
      },
      Participant: {
        name: "Golfer",
      },
      invitedBy: firstGolferData.id,
      gameId: firstGolferGameId,
      status: "pending",
      userId: secondGolferData.id,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      id: expect.any(Number),
      gameStartTime: expect.any(String),
      gcId: golfCourseId,
    };
    const params = {
      phone: secondGolferData.phone,
      gameId: firstGolferGameId,
    };

    await deleteUserGameInvitationsWhere({});

    const gameInvitationResponse = await makeCreateUserGameInvitationApiRequest(
      params,
      firstGolferToken,
    );

    await makeUpdateUserGameInvitationApiRequest(
      { statusForSingleInvitation: "declined" },
      { invitationId: gameInvitationResponse.body.data.id },
      secondGolferToken,
    );

    const declinedInvitation = await getOneUserGameInvitation({
      userId: secondGolferData.id,
      gameId: firstGolferGameId,
    });

    expect(declinedInvitation.status).toBe("declined");

    const secondTimeInvitationResponse =
      await makeCreateUserGameInvitationApiRequest(params, firstGolferToken);
    expect(secondTimeInvitationResponse.body.data).toEqual(expectedResponse);
    expect(secondTimeInvitationResponse.body.success).toBe(true);

    expect(secondTimeInvitationResponse.statusCode).toBe(200);
    expect(mqttMessageSpy).toHaveBeenCalledWith(
      `u/${secondGolferData.id}/data`,
      { action: "invitations" },
      false,
    );
    mqttMessageSpy.mockRestore();
  });
});