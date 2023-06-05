const helper = require("../../../../helper");
const models = require("../../../../../models/index");
const jwt = require("jsonwebtoken");
const Course = models.Course;
const { v4: uuidv4 } = require("uuid");

const mainHelper = require("../../../../../common/helper");
describe("Patch: /games/holes", () => {
  let golferToken;
  let createdCourses;
  let createdGame;
  let getHoles;
  let golferUser;
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
    it("should update game holes if game Id is correct", async () => {
      const mqttMessageSpy = jest
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
            expect(payload).toEqual({
              channel: `game/${createdGame.gameId}/screens`,
              message: {
                action: "scorecard",
              },
              retained: true,
              qos: 1,
              stringify: true,
            });
          },
        );
      const response = await helper.patch_request_with_authorization({
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
        },
      });
      const expectedResponse = expect.objectContaining({
        success: true,
        data: "Scorecard updated successfully",
      });
      expect(response.body).toEqual(expectedResponse);
      mqttMessageSpy.mockRestore();
    });

    it("should return already up to date if the record with the specified query params not found", async () => {
      const response = await helper.patch_request_with_authorization({
        endpoint: `games/holes`,
        token: golferToken,
        params: {
          noOfShots: 1,
        },
        queryParams: {
          userId: -1,
          holeNumber: -1,
          gameId: "INVALID",
        },
      });
      const expectedResponse = expect.objectContaining({
        success: true,
        data: "Scorecard already up to date",
      });
      expect(response.body).toEqual(expectedResponse);
    });
  });

  describe("Fail", () => {
    it("should throw exception if hole field no of shots have string value", async () => {
      const response = await helper.patch_request_with_authorization({
        endpoint: `games/holes`,
        token: golferToken,
        params: {
          noOfShots: "hello",
        },
      });
      expect(response.body.data.errors.noOfShots).toEqual(
        expect.arrayContaining(["The noOfShots must be an integer."]),
      );
      expect(response.statusCode).toEqual(400);
    });
  });
});
