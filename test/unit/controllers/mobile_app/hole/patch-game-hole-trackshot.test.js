const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const helper = require("../../../../helper");
const models = require("../../../../../models/index");
const mainHelper = require("../../../../../common/helper");

const Course = models.Course;

describe("Patch: /games/holes/track-shot", () => {
  let golferToken;
  let createdCourses;
  let createdGame;
  let getHoles;
  let golferUser;
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

  beforeAll(async () => {
    golferToken = await helper.get_token_for("golfer");
    golferUser = jwt.decode(golferToken);

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
    createdGame = (
      await helper.post_request_with_authorization({
        endpoint: "games",
        token: golferToken,
        params: params,
      })
    )?.body?.data;
    getHoles = (
      await helper.get_request_with_authorization({
        endpoint: `games/holes`,
        token: golferToken,
      })
    )?.body.data;
  });

  afterAll(async () => {
    await models.Game.destroy({
      where: {
        gameId: createdGame.gameId,
      },
    });
  });

  describe("Success", () => {
    it("should update trackshot of a hole if game Id is correct", async () => {
      const response = await helper.patch_request_with_authorization({
        endpoint: `games/holes/track-shot`,
        token: golferToken,
        queryParams: {
          userId: golferUser.id,
          holeNumber: holes[0].holeNumber,
          gameId: createdGame.gameId,
        },
        params: {
          trackedShots: '[{"lat":"35.5","long":"100.1"}]',
          updatedAt: new Date(),
        },
      });
      const expectedResponse = expect.objectContaining({
        success: true,
        data: "Trackshot updated successfully",
      });
      expect(response.body).toEqual(expectedResponse);
    });

    it("should return already up to date if the hole number is incorrect", async () => {
      const response = await helper.patch_request_with_authorization({
        endpoint: `games/holes/track-shot`,
        token: golferToken,
        params: {
          trackedShots: '[{"lat":"35.5","long":"100.1"}]',
          updatedAt: new Date(),
        },
        queryParams: {
          userId: golferUser.id,
          holeNumber: -1,
          gameId: createdGame.gameId,
        },
      });
      const expectedResponse = expect.objectContaining({
        success: true,
        data: "Trackshot already up to date",
      });
      expect(response.body).toEqual(expectedResponse);
    });

    it("should return already up to date if updateAt has old date, time", async () => {
      // create game
      const params = {
        gcId: createdCourses[0].id,
        teeColor: "Red",
        gameId: uuidv4(),
        startTime: new Date(),
        holes,
      };
      const createdGame = (
        await helper.post_request_with_authorization({
          endpoint: "games",
          token: golferToken,
          params: params,
        })
      )?.body?.data;
      const response = await helper.patch_request_with_authorization({
        endpoint: `games/holes/track-shot`,
        token: golferToken,
        queryParams: {
          userId: golferUser.id,
          holeNumber: holes[0].holeNumber,
          gameId: createdGame.gameId,
        },
        params: {
          trackedShots: '[{"lat":"35.5","long":"100.1"}]',
          updatedAt: "2019-05-22T10:30:00+03:00",
        },
      });
      const expectedResponse = expect.objectContaining({
        success: true,
        data: "Trackshot already up to date",
      });
      expect(response.body).toEqual(expectedResponse);
    });
  });

  describe("Fail", () => {
    it("should throw exception game id is missing", async () => {
      const response = await helper.patch_request_with_authorization({
        endpoint: `games/holes/track-shot`,
        token: golferToken,
        params: {
          trackedShots: '[{"lat":"35.5","long":"100.1"}]',
          updatedAt: new Date(),
        },
        queryParams: {
          userId: golferUser.id,
          holeNumber: holes[0].holeNumber,
        },
      });
      const expectedResponse = expect.objectContaining({
        success: false,
        data: {
          errors: {
            gameId: ["The gameId field is required."],
          },
        },
      });
      expect(response.body).toEqual(expectedResponse);
      expect(response.statusCode).toEqual(400);
    });

    it("should throw exception user id is missing", async () => {
      const response = await helper.patch_request_with_authorization({
        endpoint: `games/holes/track-shot`,
        token: golferToken,
        params: {
          trackedShots: '[{"lat":"35.5","long":"100.1"}]',
          updatedAt: new Date(),
        },
        queryParams: {
          holeNumber: holes[0].holeNumber,
          gameId: createdGame.gameId,
        },
      });
      const expectedResponse = expect.objectContaining({
        success: false,
        data: {
          errors: {
            userId: ["The userId field is required."],
          },
        },
      });
      expect(response.body).toEqual(expectedResponse);
      expect(response.statusCode).toEqual(400);
    });

    it("should throw exception if holeNumber has string value", async () => {
      const response = await helper.patch_request_with_authorization({
        endpoint: `games/holes/track-shot`,
        token: golferToken,
        params: {
          trackedShots: '[{"lat":"35.5","long":"100.1"}]',
          updatedAt: new Date(),
        },
        queryParams: {
          userId: golferUser.id,
          holeNumber: "abc",
          gameId: createdGame.gameId,
        },
      });

      const expectedResponse = expect.objectContaining({
        success: false,
        data: {
          errors: {
            holeNumber: ["The holeNumber must be an integer."],
          },
        },
      });

      expect(response.body).toEqual(expectedResponse);
      expect(response.statusCode).toEqual(400);
    });
  });
});
