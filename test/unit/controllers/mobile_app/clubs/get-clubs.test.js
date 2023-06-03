const jwt = require("jsonwebtoken");

const {
  createClub,
  deleteClubs,
} = require("../../../../../services/mobile/clubs");
const testHelpers = require("../../../../helper");

let golferToken;
let golferId;

describe("GET /clubs", () => {
  const clubsData = {
    driver: 4,
    wood3: 2,
    wood5: 1,
    iron4: 2,
    iron5: 1,
    iron6: 4,
    iron7: 2,
  };

  beforeAll(async () => {
    golferToken = await testHelpers.get_token_for("golfer");
    golferId = jwt.decode(golferToken).id;
  });

  beforeAll(async () => {
    await deleteClubs({
      userId: golferId,
    });
  });

  const makeGetClubsApiRequest = async () => {
    return await testHelpers.get_request_with_authorization({
      endpoint: "clubs",
      token: golferToken,
    });
  };

  it("should return the clubs of the logged in user", async () => {
    const expectedResponse = {
      success: true,
      data: {
        iron8: 0,
        iron9: 0,
        pitchingWedge: 0,
        wedge52: 0,
        wedge56: 0,
        wedge60: 0,
        putter: 0,
        gapWedge: 0,
        sandWedge: 0,
        lobWedge: 0,
        driver: 4,
        wood3: 2,
        wood5: 1,
        iron4: 2,
        iron5: 1,
        iron6: 4,
        iron7: 2,
      },
    };
    await createClub({
      ...clubsData,
      userId: golferId,
    });

    const response = await makeGetClubsApiRequest();
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(200);
  });
  it("should return the clubs of the logged in user", async () => {
    const expectedResponse = {
      success: false,
      data: "No club associated with the user",
    };
    await deleteClubs({
      userId: golferId,
    });
    const response = await makeGetClubsApiRequest();
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(404);

    // create it again to remove any tests dependencies
    await createClub({
      ...clubsData,
      userId: golferId,
    });
  });
});
