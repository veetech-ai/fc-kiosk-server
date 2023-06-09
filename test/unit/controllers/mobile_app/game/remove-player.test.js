const helper = require("../../../../helper");
const mainHelper = require("../../../../../common/helper");

const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

let createdGame;
let nonOwnerInvitedPlayer, gameOwnerId;
let gameOwnerToken, superAdminToken, nonOwnerInvitedPlayerToken;
const seededGolfCourseId = 1;
const models = require("../../../../../models/index");
const {
  deleteUserGameInvitationsWhere,
} = require("../../../../../services/mobile/user-game-invitations");

describe("POST: /games", () => {
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

  const makeRemovePlayerFromAGameApiRequest = async (params, token) => {
    return await helper.delete_request_with_authorization({
      endpoint: "games/users",
      token: token,
      queryParams: params,
    });
  };

  jest.spyOn(mainHelper, "send_sms").mockImplementation(
    jest.fn((otpCode) => {
      return Promise.resolve(otpCode);
    }),
  );
  beforeAll(async () => {
    superAdminToken = await helper.get_token_for();

    gameOwnerToken = await helper.get_token_for("golfer");
    gameOwnerId = jwt.decode(gameOwnerToken).id;
    nonOwnerInvitedPlayerToken = await helper.get_token_for("testGolfer");
    nonOwnerInvitedPlayer = jwt.decode(nonOwnerInvitedPlayerToken);

    const gameCreationBody = {
      teeColor: "Red",
      holes: [
        {
          holeId: 31931,
          holeNumber: 1,
          par: 4,
        },
      ],
      gcId: seededGolfCourseId,
    };

    const createGameResponse = await makeCreateGameApiRequest(
      { ...gameCreationBody, gameId: uuidv4(), startTime: new Date() },
      gameOwnerToken,
    );

    createdGame = createGameResponse.body.data;

    // Add players to the created game
  });

  afterAll(async () => {
    await models.Game.destroy({
      where: {
        gameId: createdGame.gameId,
      },
    });
  });
  it("Should return 400 and validation error if the required params are not sent", async () => {
    const expectedResponse = {
      success: false,
      data: {
        errors: {
          participantId: ["The participantId field is required."],
          gameId: ["The gameId field is required."],
        },
      },
    };
    const gameInvitationResponse = await makeRemovePlayerFromAGameApiRequest(
      {},
      gameOwnerToken,
    );

    expect(gameInvitationResponse.body).toEqual(expectedResponse);
    expect(gameInvitationResponse.statusCode).toEqual(400);
  });

  it("should return an error if the player who is not the owner of the game tries to remove a player", async () => {
    const expectedResponse = {
      success: false,
      data: "Only game owner can remove the player",
    };
    const invitation = await makeCreateUserGameInvitationApiRequest(
      {
        gameId: createdGame.gameId,
        phone: nonOwnerInvitedPlayer.phone,
      },
      gameOwnerToken,
    );

    const params = {
      participantId: nonOwnerInvitedPlayer.id,
      gameId: createdGame.gameId,
    };
    const response = await makeRemovePlayerFromAGameApiRequest(
      params,
      nonOwnerInvitedPlayerToken,
    );

    await deleteUserGameInvitationsWhere({
      id: invitation.body.data.id,
    });

    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(403);
  });

  it("should return an error if someone tries to remove the game owner", async () => {
    const expectedResponse = {
      success: false,
      data: "Game owner can not be removed from the game",
    };

    const params = {
      participantId: gameOwnerId,
      gameId: createdGame.gameId,
    };
    const response = await makeRemovePlayerFromAGameApiRequest(
      params,
      gameOwnerToken,
    );

    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(403);
  });

  it("should return an error if the player does not exist or does not belong to the specified game", async () => {
    const expectedResponse = {
      success: false,
      data: "Player deletion failed",
    };

    const params = {
      participantId: -1,
      gameId: createdGame.gameId,
    };
    const response = await makeRemovePlayerFromAGameApiRequest(
      params,
      gameOwnerToken,
    );

    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(404);
  });

  it("should delete the anonymous player successfully", async () => {
    const expectedResponse = {
      success: true,
      data: "Player removed from the game successfully",
    };

    // first add the player
    const addPlayerResponse = await makeCreateUserGameInvitationApiRequest(
      {
        gameId: createdGame.gameId,
        name: "Kamran",
      },
      gameOwnerToken,
    );
    const anonymousPlayerId = addPlayerResponse.body.data.participantId;
    const params = {
      participantId: anonymousPlayerId,
      gameId: createdGame.gameId,
    };

    const holesBeforeRemoval = models.Hole.findOne({
      where: {
        userId: anonymousPlayerId,
        gameId: createdGame.gameId,
      },
    });
    expect(holesBeforeRemoval).not.toBe(null);
    const response = await makeRemovePlayerFromAGameApiRequest(
      params,
      gameOwnerToken,
    );

    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(200);

    const holesAfterRemoval = await models.Hole.findOne({
      where: {
        userId: anonymousPlayerId,
        gameId: createdGame.gameId,
      },
    });

    expect(holesAfterRemoval).toBe(null);

    const anonymousPlayerGameAfterPlayerRemoval = await models.Game.findOne({
      where: {
        participantId: anonymousPlayerId,
        gameId: createdGame.gameId,
      },
    });
    expect(anonymousPlayerGameAfterPlayerRemoval).toBe(null);
  });

  it("Should return error in case of super admin", async () => {
    const expectedResponse = {
      success: false,
      data: "You are not allowed",
    };
    const params = {
      participantId: 1,
      gameId: createdGame.gameId,
    };
    const gameInvitationResponse = await makeRemovePlayerFromAGameApiRequest(
      params,
      superAdminToken,
    );

    expect(gameInvitationResponse.body).toEqual(expectedResponse);
    expect(gameInvitationResponse.statusCode).toEqual(403);
  });
});
