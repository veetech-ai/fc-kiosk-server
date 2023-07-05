const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const helper = require("../../../../helper");
const models = require("../../../../../models/index");
const mainHelper = require("../../../../../common/helper");
const { async } = require("crypto-random-string");
const gameService = require("../../../../../services/mobile/game");
const statisticsService = require("../../../../../services/mobile/statistics");
const {
  updateInvitationById,
} = require("../../../../../services/mobile/user-game-invitations");

const Course = models.Course;
const Statistic = models.Statistic;
const Game = models.Game;

describe("GET: /user/{userId}/game/statistics", () => {
  let golferToken;
  let createdCourses;
  let createdGame;
  let secondGolferToken;
  let golferUser;
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
  ];

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
  });

  afterAll(() => {
    mqttMessageSpy.mockRestore();
  });

  describe("Success in case of calclulation of statistic of game owner", () => {
    beforeAll(async () => {
      await Statistic.destroy({ where: {} });
      await Game.destroy({ where: {} });
    });
    const makeGetStatisticsApiRequest = async (userId) => {
      return await helper.get_request_with_authorization({
        endpoint: `user/${userId}/games/statistics`,
        token: golferToken,
      });
    };
    it("should return statistics if the user who has played his/her first game is ended", async () => {
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
      await helper.patch_request_with_authorization({
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
          score: -7,
        },
      });
      await helper.patch_request_with_authorization({
        endpoint: `games/${createdGame.gameId}/end-game`,
        token: golferToken,
        params: {
          endTime: new Date(),
        },
      });
      const statistics = await gameService.findStatisticsByParticipantId(
        golferUser.id,
      );
      const expectedResponse = {
        success: true,
        data: {
          statistics: {
            rounds: 1,
            worstScore: statistics.worstScore,
            bestScore: statistics.bestScore,
            avg: statistics.avg,
            avgGirPercentage: statistics.avgGirPercentage,
          },
        },
      };

      const response = await makeGetStatisticsApiRequest(golferUser.id);
      expect(response.body).toMatchObject(expectedResponse);
    });
    it("should return statistics if the user who has his previous record of status updated", async () => {
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

      await helper.patch_request_with_authorization({
        endpoint: `games/holes`,
        token: golferToken,
        queryParams: {
          userId: golferUser.id,
          holeNumber: holes[0].holeNumber,
          gameId: createdGame.gameId,
        },
        params: {
          noOfShots: 3,
          trackedShots: '[{"lat":36.5,"long":101.1,"isFromGreen":true}]',
          updatedAt: new Date(),
          score: -5,
        },
      });

      await helper.patch_request_with_authorization({
        endpoint: `games/${createdGame.gameId}/end-game`,
        token: golferToken,
        params: {
          endTime: new Date(),
        },
      });

      const statistics = await gameService.findStatisticsByParticipantId(
        golferUser.id,
      );

      const expectedResponse = {
        success: true,
        data: {
          statistics: {
            rounds: statistics.rounds,
            worstScore: statistics.worstScore,
            bestScore: statistics.bestScore,
            avg: statistics.avg,
            avgGirPercentage: statistics.avgGirPercentage,
          },
        },
      };

      const response = await makeGetStatisticsApiRequest(golferUser.id);

      expect(response.body).toMatchObject(expectedResponse);
    });
  });

  describe("Fail", () => {
    beforeAll(async () => {
      await Statistic.destroy({ where: {} });
      await Game.destroy({ where: {} });
    });
    const makeGetStatisticsApiRequest = async (userId) => {
      return await helper.get_request_with_authorization({
        endpoint: `user/${userId}/games/statistics`,
        token: golferToken,
      });
    };
    it("should return stats not found if no shot has been played and the game is already being ended", async () => {
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

      await helper.patch_request_with_authorization({
        endpoint: `games/${createdGame.gameId}/end-game`,
        token: golferToken,
        params: {
          endTime: new Date(),
        },
      });

      const expectedResponse = {
        success: true,
        data: {
          bestRounds: [],
          statistics: {
            avg: null,
            bestScore: null,
            avgGirPercentage: null,
            rounds: 0,
            worstScore: null,
          },
        },
      };
      const response = await makeGetStatisticsApiRequest(golferUser.id);
      expect(response.body).toMatchObject(expectedResponse);
    });

    it("should return stats not found if the stats of that particular game is fetched before the games end ", async () => {
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

      const expectedResponse = {
        success: true,
        data: {
          bestRounds: [],
          statistics: {
            avg: null,
            bestScore: null,
            avgGirPercentage: null,
            rounds: 0,
            worstScore: null,
          },
        },
      };
      const response = await makeGetStatisticsApiRequest(golferUser.id);
      expect(response.body).toMatchObject(expectedResponse);
    });
  });

  describe("invited user staistics", () => {
    beforeAll(async () => {
      await Statistic.destroy({ where: {} });
      await Game.destroy({ where: {} });
    });
    let gameId;
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
        token: golferToken,
        params,
      });
      return invitation;
    };

    const makeCreateUserGameInvitationApiRequest = async (
      statuses,
      phone = secondGolferUser?.phone,
    ) => {
      const invitationsWithStatus = [];
      for await (const status of statuses) {
        const gameCreationResponse = await makeCreateGameApiRequest(
          { ...gameCreationBody, gameId: uuidv4(), startTime: new Date() },
          golferToken,
        );
        gameId = gameCreationResponse.body.data.gameId;
        const invitationParams = {
          gameId: gameCreationResponse.body.data.gameId,
          name: "najmi",
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
    const makeGetStatisticsApiRequest = async (userId) => {
      return await helper.get_request_with_authorization({
        endpoint: `user/${userId}/games/statistics`,
        token: secondGolferToken,
      });
    };
    it("should return stats not found if no shot has been played and the game is already being ended", async () => {
      const statuses = ["pending"];
      const invitations = await makeCreateUserGameInvitationApiRequest(
        statuses,
      );

      const body = {
        statusForSingleInvitation: "accepted",
      };

      await makeUpdateUserGameInvitationApiRequest(
        {
          statusForSingleInvitation: "accepted",
        },
        { invitationId: invitations[0].id },
        secondGolferToken,
      );
      await helper.patch_request_with_authorization({
        endpoint: `games/holes`,
        token: secondGolferToken,
        queryParams: {
          userId: secondGolferUser.id,
          holeNumber: holes[0].holeNumber,
          gameId,
        },
        params: {
          noOfShots: 3,
          trackedShots: '[{"lat":36.5,"long":101.1,"isFromGreen":true}]',
          updatedAt: new Date(),
          score: -1,
        },
      });
      await helper.patch_request_with_authorization({
        endpoint: `games/${gameId}/end-game`,
        token: golferToken,
        params: {
          endTime: new Date(),
        },
      });
      const statistics = await gameService.findStatisticsByParticipantId(
        secondGolferUser.id,
      );

      const expectedResponse = {
        success: true,
        data: {
          statistics: {
            rounds: 1,
            worstScore: statistics.worstScore,
            bestScore: statistics.bestScore,
            avg: statistics.avg,
            avgGirPercentage: statistics.avgGirPercentage,
          },
        },
      };

      const response = await makeGetStatisticsApiRequest(secondGolferUser.id);
      expect(response.body).toMatchObject(expectedResponse);
    });
    it("should return stats not found if no shot has been played and the game is already being ended", async () => {
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
          token: secondGolferToken,
          params: params,
        })
      )?.body?.data;

      await helper.patch_request_with_authorization({
        endpoint: `games/holes`,
        token: golferToken,
        queryParams: {
          userId: secondGolferUser.id,
          holeNumber: holes[0].holeNumber,
          gameId: createdGame.gameId,
        },
        params: {
          noOfShots: 3,
          trackedShots: '[{"lat":36.5,"long":101.1,"isFromGreen":true}]',
          updatedAt: new Date(),
          score: -5,
        },
      });

      await helper.patch_request_with_authorization({
        endpoint: `games/${createdGame.gameId}/end-game`,
        token: secondGolferToken,
        params: {
          endTime: new Date(),
        },
      });

      const statistics = await gameService.findStatisticsByParticipantId(
        secondGolferUser.id,
      );

      const expectedResponse = {
        success: true,
        data: {
          statistics: {
            rounds: statistics.rounds,
            worstScore: statistics.worstScore,
            bestScore: statistics.bestScore,
            avg: statistics.avg,
            avgGirPercentage: statistics.avgGirPercentage,
          },
        },
      };

      const response = await makeGetStatisticsApiRequest(secondGolferUser.id);

      expect(response.body).toMatchObject(expectedResponse);
    });
  });
});
