const helper = require("../../../../helper");
const userServices = require("../../../../../services/user");
const mainHelper = require("../../../../../common/helper");

const jwt = require("jsonwebtoken");
const nonExistingPhoneNo = "+12021262192";
const { v4: uuidv4 } = require("uuid");
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
    console.log(firstGameResponse.body);
    const secondGameResponse = await makeCreateGameApiRequest(
      { ...gameCreationBody, gameId: uuidv4(), startTime: new Date() },
      secondGolferToken,
    );

    firstGolferGameId = firstGameResponse.body.data.gameId; // firstGolfer is the owner of the game
    secondGolferGameId = secondGameResponse.body.data.gameId; // secondGolfer is the owner of the game
  });

  it("Should return 400 and validation error because of invalid phoneNo and gameId", async () => {
    const expectedResponse = {
      success: false,
      data: {
        errors: {
          phoneNo: ["The phoneNo field is required."],
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
          phoneNo: ["The phoneNo format is invalid."],
          gameId: ["The gameId must be a string."],
        },
      },
    };

    const params = {
      phoneNo: "+123",
      gameId: 123,
    };
    const gameInvitationResponse = await makeCreateUserGameInvitationApiRequest(
      params,
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
      phoneNo: secondGolferData.phone,
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
      phoneNo: firstGolferData.phone,
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
      phoneNo: nonExistingPhoneNo,
      gameId: firstGolferGameId,
    };

    const noOfRecords = await userServices.PhoneExists(nonExistingPhoneNo);
    expect(noOfRecords).toBe(0);

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
});
