const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const helper = require("../../../../helper");
const models = require("../../../../../models/index");
const {
  organizationsInApplication,
} = require("../../../../../common/organizations.data");

const seededGolfCourseId = 1;

describe("Get: /games", () => {
  let golferToken;
  let secondGolferToken;
  let seededGolfCourse;
  let createdGame;
  let updateScore;
  let golferUser;
  const holes = [
    {
      holeId: 31931,
      holeNumber: 1,
      par: 4,
    },
    {
      holeId: 31931,
      holeNumber: 2,
      par: 4,
    },
    {
      holeId: 31931,
      holeNumber: 3,
      par: 4,
    },
  ];

  beforeAll(async () => {
    secondGolferToken = await helper.get_token_for("testGolfer");
    golferToken = await helper.get_token_for("golfer");
    golferUser = jwt.decode(golferToken);
    seededGolfCourse = await models.Mobile_Course.findOne({
      where: {
        id: seededGolfCourseId,
      },
    });

    // create game
    const paramsGame = {
      gcId: seededGolfCourseId,
      gameId: uuidv4(),
      startTime: new Date(),
      teeColor: "Red",
      score: 1,
      holes,
    };
    createdGame = (
      await helper.post_request_with_authorization({
        endpoint: "games",
        token: golferToken,
        params: paramsGame,
      })
    )?.body?.data;

    updateScore = await helper.patch_request_with_authorization({
      endpoint: `games/holes`,
      token: golferToken,
      queryParams: {
        userId: golferUser.id,
        holeNumber: holes[0].holeNumber,
        gameId: createdGame.gameId,
      },
      params: {
        noOfShots: 1,
        trackedShots: '[{"lat":35.5,"long":100.1,"isFromGreen":true}]',
        updatedAt: new Date(),
        score: 1,
      },
    });
  });

  afterAll(async () => {
    await models.Game.destroy({
      where: {},
    });
  });

  describe("Success", () => {
    it("should get games for golfer", async () => {
      const expectedResponse = [
        expect.objectContaining({
          id: expect.any(Number),
          gameId: createdGame.gameId,
          orgId: organizationsInApplication.golfers.id,
          participantId: golferUser.id,
          ownerId: golferUser.id,
          startTime: expect.any(String),
          endTime: null,
          totalShotsTaken: 1,
          totalIdealShots: createdGame.totalIdealShots,
          gcId: seededGolfCourseId,
          Golf_Course: {
            name: seededGolfCourse.name,
          },
          teeColor: createdGame.teeColor,
          score: expect.any(Number),
          girPercentage: null,
          updatedAt: expect.any(String),
        }),
      ];

      const response = await helper.get_request_with_authorization({
        endpoint: `games`,
        token: golferToken,
      });
      expect(response.body.data).toEqual(
        expect.arrayContaining(expectedResponse),
      );
      expect(response.status).toBe(200);
    });
    it("should return empty array if no games found", async () => {
      const secondGolferId = jwt.decode(secondGolferToken).id;
      await models.Game.destroy({
        where: {
          participantId: secondGolferId,
        },
      });

      const response = await helper.get_request_with_authorization({
        endpoint: `games`,
        token: secondGolferToken, // Using a different user token to simulate no games found
      });
      expect(response.body.data).toEqual([]);
      expect(response.status).toBe(200);
    });
  });
});
