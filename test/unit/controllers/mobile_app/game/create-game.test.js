const helper = require("../../../../helper");
const models = require("../../../../../models/index");
const config = require("../../../../../config/config");
const jwt = require("jsonwebtoken");
const Course = models.Course;

describe("POST: /games", () => {
  let golferToken;
  let createdCourses;
  let golferUser;
  let superAdminToken;
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
  const makeCreateGameApiRequest = async (params, token = golferToken) => {
    return await helper.post_request_with_authorization({
      endpoint: "games",
      token: token,
      params: params,
    });
  };
  beforeAll(async () => {
    golferToken = await helper.get_token_for("golfer");
    superAdminToken = await helper.get_token_for();
    golferUser = jwt.decode(golferToken);

    const courses = [
      {
        name: "Course 1",
        city: "Test City 1",
        state: "Test State 1",
        org_id: golferUser.orgId,
      },
    ];

    createdCourses = await Course.bulkCreate(courses);
  });

  describe("Success", () => {
    it("should create the game successfully when parameters are valid", async () => {
      const params = {
        gcId: createdCourses[0].id,
        teeColor: "Red",
        holes,
      };
      const expectedResponse = {
        id: expect.any(Number),
        gcId: createdCourses[0].id,
        totalIdealShots: holes.reduce(
          (accumulate, hole) => accumulate + hole.par,
          0,
        ),
        teeColor: "Red",
        ownerId: golferUser.id,
        participantId: golferUser.id,
        participantName: golferUser.name,
        orgId: golferUser.orgId,
        createdAt: expect.any(String),
        gameId: expect.any(String),
        startTime: expect.any(String),
        updatedAt: expect.any(String),
      };

      const response = await makeCreateGameApiRequest(params);

      expect(response.body.data).toEqual(
        expect.objectContaining(expectedResponse),
      );
      expect(response.status).toBe(200);
    });
  });
  describe("Fail", () => {
    it("should fail if course is not passed", async () => {
      const params = {
        teeColor: "Red",
        holes,
      };

      const response = await makeCreateGameApiRequest(params);

      expect(response.body.data.errors.gcId).toEqual(
        expect.arrayContaining(["The gcId field is required."]),
      );
      expect(response.statusCode).toEqual(400);
    });
    it("should fail if course does not exist", async () => {
      const wrongCourseId = -1;
      const params = {
        gcId: wrongCourseId,
        teeColor: "Red",
        holes,
      };

      const response = await makeCreateGameApiRequest(params);

      expect(response.body.data).toEqual(`Course not found`);
    });

    it("should fail if tee color is not string", async () => {
      const params = {
        gcId: createdCourses[0].id,
        teeColor: 321,
        holes,
      };
      const expectedResponse = {
        success: false,
        data: expect.any(Object),
      };

      const response = await makeCreateGameApiRequest(params);

      expect(response.body).toEqual(expect.objectContaining(expectedResponse));
      expect(response.body.data.errors.teeColor).toEqual([
        "The teeColor must be a string.",
      ]);
      expect(response.statusCode).toEqual(400);
    });

    it("should fail if hole array is empty", async () => {
      const params = {
        gcId: createdCourses[0].id,
        teeColor: "Red",
        holes: [],
      };

      const response = await makeCreateGameApiRequest(params);

      expect(response.body.success).toEqual(false);
      expect(response.body.data.errors.holes).toEqual([
        "The holes field is required.",
      ]);
      expect(response.statusCode).toEqual(400);
    });

    it("should fail if super admin tries to create a game", async () => {
      // The create game API will only be accessible to the Golfer
      const params = {
        gcId: createdCourses[0].id,
        teeColor: "Red",
        holes,
      };
      const expectedResponse = {
        success: false,
        data: "You are not allowed",
      };

      const response = await makeCreateGameApiRequest(params, superAdminToken);

      expect(response.body).toEqual(expectedResponse);

      expect(response.statusCode).toEqual(403);
    });
  });
});
