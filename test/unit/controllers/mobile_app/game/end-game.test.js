const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const helper = require("../../../../helper");
const models = require("../../../../../models/index");
const mainHelper = require("../../../../../common/helper");

const Course = models.Course;

describe("Patch: /games/{gameId}/end-game", () => {
  let golferToken;
  let createdCourses;
  let createdGame;
  let secondGolferToken;
  let golferUser;
  let invitesUserToGameResponse;
  let secondGolferUser;
  let mqttMessageSpy;
  const holes = [
    {
      holeId: 31931,
      holeNumber: 1,
      par: 4,
    },
    {
      holeId: 31932,
      holeNumber: 2,
      par: 4,
    },
    {
      holeId: 31933,
      holeNumber: 3,
      par: 4,
    },
  ];

  const invitesUserToGame = async (token, params) => {
    return await helper.post_request_with_authorization({
      endpoint: "user-game-invitations",
      token: token,
      params,
    });
  };

  beforeAll(async () => {
    // Mock Twilio
    jest.spyOn(mainHelper, "send_sms").mockImplementation(
      jest.fn((phone, message) => {
        return Promise.resolve({ phone, message });
      }),
    );

    // Mock MQTT
    mqttMessageSpy = jest
      .spyOn(mainHelper, "mqtt_publish_message")
      .mockImplementation(
        (channel, message, retained = true, qos = 1, stringify = true) => {
          const payload = {
            channel,
            message,
            qos,
            stringify,
            retained,
          };
        },
      );

    golferToken = await helper.get_token_for("golfer");
    golferUser = jwt.decode(golferToken);

    secondGolferToken = await helper.get_token_for("testGolfer");
    secondGolferUser = jwt.decode(secondGolferToken);

    const courses = [
      {
        name: "Course 1",
        city: "Test City 1",
        state: "Test State 1",
        org_id: golferUser.orgId,
      },
    ];

    // create course
    createdCourses = await Course.bulkCreate(courses);

    // create game
    const params = {
      gcId: createdCourses[0].id,
      teeColor: "Red",
      gameId: uuidv4(),
      startTime: new Date(),
      holes,
    };

    // create game
    createdGame = (
      await helper.post_request_with_authorization({
        endpoint: "games",
        token: golferToken,
        params: params,
      })
    )?.body?.data;

    invitesUserToGameResponse = (
      await invitesUserToGame(golferToken, {
        gameId: createdGame.gameId,
        name: "golfer",
        phone: secondGolferUser.phone,
      })
    )?.body?.data;

    // update game hole
    await models.Hole.update(
      { isGir: true },
      {
        where: { gameId: createdGame.gameId, holeNumber: holes[0].holeNumber },
      },
    );
  });

  afterAll(() => {
    mqttMessageSpy.mockRestore();
  });

  describe("Success", () => {
    let endGameResponse;
    beforeAll(async () => {
      endGameResponse = await helper.patch_request_with_authorization({
        endpoint: `games/${createdGame.gameId}/end-game`,
        token: golferToken,
        params: {
          endTime: new Date(),
        },
      });
    });

    it("game should be ended successfully", async () => {
      const expectedResponse = expect.objectContaining({
        success: true,
        data: "Game ended successfully",
      });
      expect(endGameResponse.body).toEqual(expectedResponse);
      expect(endGameResponse.statusCode).toEqual(200);
    });

    it("game gir percentage should be updated on game end", async () => {
      const game = await models.Game.findOne({
        where: { gameId: createdGame.gameId },
      });
      expect(game.girPercentage).toEqual(33.33);
    });

    it("all un accepted game invitation should be mark as invalid", async () => {
      const gameInvitation = await models.User_Game_Invitation.findOne({
        where: {
          id: invitesUserToGameResponse.id,
        },
      });
      expect(gameInvitation.status).toEqual("invalid");
    });
  });

  describe("Fail", () => {
    it("should throw exception if wrong game Id is passed", async () => {
      const wrongGameId = -1;
      const response = await helper.patch_request_with_authorization({
        endpoint: `games/${wrongGameId}/end-game`,
        token: golferToken,
        params: {
          endTime: new Date(),
        },
      });
      const expectedResponse = expect.objectContaining({
        success: false,
        data: "Game not found",
      });
      expect(response.body).toEqual(expectedResponse);
      expect(response.statusCode).toEqual(400);
    });

    it("should throw exception if end time is wrong", async () => {
      const response = await helper.patch_request_with_authorization({
        endpoint: `games/${createdGame.gameId}/end-game`,
        token: golferToken,
        params: {
          endTime: "invalid time",
        },
      });
      const expectedResponse = expect.objectContaining({
        success: false,
        data: "End time is invalid.",
      });
      expect(response.body).toEqual(expectedResponse);
      expect(response.statusCode).toEqual(400);
    });

    it("should throw exception if other then owner of game try to end game", async () => {
      const response = await helper.patch_request_with_authorization({
        endpoint: `games/${createdGame.gameId}/end-game`,
        token: secondGolferToken,
        params: {
          endTime: new Date(),
        },
      });
      const expectedResponse = expect.objectContaining({
        success: false,
        data: "Game not found",
      });
      expect(response.body).toEqual(expectedResponse);
      expect(response.statusCode).toEqual(400);
    });

    it("should throw exception if the end time is not passed", async () => {
      const response = await helper.patch_request_with_authorization({
        endpoint: `games/${createdGame.gameId}/end-game`,
        token: golferToken,
      });
      expect(response.body.data.errors.endTime).toEqual(
        expect.arrayContaining(["The endTime field is required."]),
      );
      expect(response.statusCode).toEqual(400);
    });
  });
});
