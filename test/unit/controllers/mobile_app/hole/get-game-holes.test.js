const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const helper = require("../../../../helper");
const models = require("../../../../../models/index");

const Course = models.Course;

describe("Get: /game/{gameId}/holes", () => {
  let golferToken;
  let secondGolferToken;
  let createdCourses;
  let createdGame;
  let golferUser;
  const holes = [
    {
      holeId: 31931,
      holeNumber: 1,
      par: 4,
    },
    {
      holeId: 31931,
      holeNumber: 1,
      par: 4,
    },
    {
      holeId: 31931,
      holeNumber: 1,
      par: 4,
    },
  ];

  beforeAll(async () => {
    secondGolferToken = await helper.get_token_for("testGolfer");
    golferToken = await helper.get_token_for("golfer");
    golferUser = jwt.decode(golferToken);

    models.Hole.destroy({ truncate: true });

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
      totalIdealShots: 5,
      gameId: uuidv4(),
      startTime: new Date(),
      teeColor: "Red",
      holes,
    };
    createdGame = (
      await helper.post_request_with_authorization({
        endpoint: "games",
        token: golferToken,
        params: params,
      })
    )?.body?.data;
  });

  describe("Success", () => {
    it("should get game holes if game Id is correct", async () => {
      const expectedResponse = [
        {
          Holes: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              par: 4,
              noOfShots: null,
              isGir: false,
              trackedShots: null,
              updatedAt: expect.any(String),
            }),
            expect.objectContaining({
              id: expect.any(Number),
              par: 4,
              noOfShots: null,
              isGir: false,
              trackedShots: null,
              updatedAt: expect.any(String),
            }),
            expect.objectContaining({
              id: expect.any(Number),
              par: 4,
              noOfShots: null,
              isGir: false,
              trackedShots: null,
              updatedAt: expect.any(String),
            }),
          ]),
          id: createdGame.id,
          teeColor: "Red",
          startTime: expect.any(String),
          endTime: null,
          score: null,
          ownerId: golferUser.id,
          participantId: golferUser.id,
          participantName: "Golfer",
          updatedAt: expect.any(String),
        },
      ];

      const response = await helper.get_request_with_authorization({
        endpoint: `games/${createdGame.gameId}`,
        token: golferToken,
      });
      expect(response.body.data).toEqual(
        expect.arrayContaining(expectedResponse),
      );
      expect(response.status).toBe(200);
    });

    it("should get game hole if game Id and hole Id is correct", async () => {
      const hole = await models.Hole.findOne({ ownerId: golferUser.id });

      const expectedResponse = [
        {
          Holes: expect.arrayContaining([
            expect.objectContaining({
              id: hole.id,
              par: 4,
              noOfShots: null,
              isGir: false,
              trackedShots: null,
              updatedAt: expect.any(String),
            }),
          ]),
          id: createdGame.id,
          teeColor: "Red",
          startTime: expect.any(String),
          endTime: null,
          score: null,
          ownerId: golferUser.id,
          participantId: golferUser.id,
          participantName: "Golfer",
          updatedAt: expect.any(String),
        },
      ];

      const response = await helper.get_request_with_authorization({
        endpoint: `games/${createdGame.gameId}?holeId=${hole.id}`,
        token: golferToken,
      });
      expect(response.body.data).toEqual(
        expect.arrayContaining(expectedResponse),
      );
      expect(response.status).toBe(200);
    });

    it("should return empty array if hole Id is incorrect", async () => {
      const inCorrectHoleId = -1;
      const response = await helper.get_request_with_authorization({
        endpoint: `games/${createdGame.gameId}?holeId=${inCorrectHoleId}`,
        token: golferToken,
      });
      expect(response.body.data).toEqual([]);
      expect(response.status).toBe(200);
    });
  });
  describe("Fail", () => {
    it("should throw exception if the game id not belong to the user", async () => {
      const response = await helper.get_request_with_authorization({
        endpoint: `games/${createdGame.gameId}`,
        token: secondGolferToken,
      });
      expect(response.body.data).toEqual("Invalid game id");
      expect(response.status).toBe(400);
    });
    it("should return empty array if game id is incorrect", async () => {
      const inCorrectGameId = -1;
      const response = await helper.get_request_with_authorization({
        endpoint: `games/${inCorrectGameId}`,
        token: golferToken,
      });
      expect(response.body.data).toEqual("Invalid game id");
      expect(response.status).toBe(400);
    });
  });
});
