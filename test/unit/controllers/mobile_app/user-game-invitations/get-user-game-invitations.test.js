const helper = require("../../../../helper");

const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const {
  createUserGameInvitations,
} = require("../../../../../services/mobile/user-game-invitations");

const statuses = [
  "pending",
  "ignored",
  "accepted",
  "declined",
  "invalid",
  "seen",
];
const createdInvitationsBasedOnStatusInDescOrder = {
  seen: {},
  ignored: {},
  pending: {},
};
describe("POST: /games", () => {
  let superAdminToken;
  let firstGolferToken;
  let secondGolferToken;
  let firstGolferData;
  let secondGolferData;
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
      params: params,
    });
  };

  const makeGetUserGameInvitationsApiRequest = async (token) => {
    return await helper.get_request_with_authorization({
      endpoint: "user-game-invitations",
      token: token,
    });
  };

  //   const makeCreateUserGameInvitationApiRequest = async (params, token) => {
  //     return await helper.post_request_with_authorization({
  //       endpoint: "user-game-invitations",
  //       token: token,
  //       params: params,
  //     });
  //   };

  //   jest.spyOn(mainHelper, "send_sms").mockImplementation(
  //     jest.fn((otpCode) => {
  //       return Promise.resolve(otpCode);
  //     }),
  //   );
  beforeAll(async () => {
    superAdminToken = await helper.get_token_for();

    firstGolferToken = await helper.get_token_for("golfer");
    secondGolferToken = await helper.get_token_for("testGolfer");
    firstGolferData = jwt.decode(firstGolferToken);
    secondGolferData = jwt.decode(secondGolferToken);

    const gameCreationBody = {
      teeColor: "Red",
      gcId: 1,
      holes,
    };

    for await (const status of statuses) {
      const gameCreationResponse = await makeCreateGameApiRequest(
        { ...gameCreationBody, gameId: uuidv4(), startTime: new Date() },
        firstGolferToken,
      );
      // gameIds.push(gameCreationResponse.body.data.gameId)

      await createUserGameInvitations({
        gameId: gameCreationResponse.body.data.gameId,
        userId: secondGolferData.id,
        status,
        invitedBy: firstGolferData.id,
      });
      if (!createdInvitationsBasedOnStatusInDescOrder[status]) continue;
      createdInvitationsBasedOnStatusInDescOrder[status] = {
        gameId: gameCreationResponse.body.data.gameId,
        userId: secondGolferData.id,
        status,
        invitedBy: firstGolferData.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        id: expect.any(Number),
      };
    }
  });

  it("should not allow the user without manageGames role right to get the user invitations", async () => {
    const expectedResponse = {
      success: false,
      data: "You are not allowed",
    };

    const response = await makeGetUserGameInvitationsApiRequest(
      superAdminToken,
    );
    expect(response.body).toEqual(expectedResponse);
  });

  it("should only return the pending, seen and ignored invitations of the logged in user", async () => {
    const expectedInvitations = Object.values(
      createdInvitationsBasedOnStatusInDescOrder,
    );

    const response = await makeGetUserGameInvitationsApiRequest(
      secondGolferToken,
    );
    expect(response.body.data).toEqual(expectedInvitations);
    expect(response.body.success).toEqual(true);
    expect(response.statusCode).toEqual(200);
  });
});
