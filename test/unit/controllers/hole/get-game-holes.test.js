const helper = require("../../../helper");
const models = require("../../../../models/index");
const jwt = require("jsonwebtoken");
const Course = models.Course;

describe("Post: /game", () => {
  let golferToken;
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
      totalIdealShots: 5,
      teeColor: "Red",
      holes,
    };
    createdGame = (
      await helper.post_request_with_authorization({
        endpoint: "game",
        token: golferToken,
        params: params,
      })
    )?.body?.data;
  });

  describe("Success", () => {
    it("should get game holes if game Id is correct", async () => {
      const expectedResponse = [
        expect.objectContaining({
          id: expect.any(Number),
          userId: 12,
          par: 4,
          noOfShots: null,
          isGir: false,
          trackedShots: null,
          User: expect.objectContaining({ id: golferUser.id, name: golferUser.name }),
        }),
        expect.objectContaining({
          id: expect.any(Number),
          userId: 12,
          par: 4,
          noOfShots: null,
          isGir: false,
          trackedShots: null,
          User: expect.objectContaining({ id: golferUser.id, name: golferUser.name }),
        }),
        expect.objectContaining({
          id: expect.any(Number),
          userId: 12,
          par: 4,
          noOfShots: null,
          isGir: false,
          trackedShots: null,
          User: expect.objectContaining({ id: golferUser.id, name: golferUser.name }),
        }),
      ];

      const response = await helper.get_request_with_authorization({
        endpoint: `holes/${createdGame.id}`,
        token: golferToken,
      });
      expect(response.body.data).toEqual(
        expect.arrayContaining(expectedResponse),
      );
      expect(response.status).toBe(200);
    });
    it("should return empty array if game id is incorrect", async () => {
      const inCorrectGameId = -1;
      const response = await helper.get_request_with_authorization({
        endpoint: `holes/${inCorrectGameId}`,
        token: golferToken,
      });
      expect(response.body.data).toEqual([]);
      expect(response.status).toBe(200);
    });
  });
});
