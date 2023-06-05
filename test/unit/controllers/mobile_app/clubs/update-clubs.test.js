const jwt = require("jsonwebtoken");
const { deleteClubs } = require("../../../../../services/mobile/clubs");
const testHelpers = require("../../../../helper");

let golferToken;
let golferId;

describe("PUT /clubs", () => {
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

  const makeUpdateClubsApiRequest = async (updates) => {
    return await testHelpers.put_request_with_authorization({
      endpoint: "clubs",
      token: golferToken,
      params: updates,
    });
  };

  it("should update the clubs of the logged in user", async () => {
    const expectedResponse = {
      success: true,
      data: {
        driver: 4,
        gapWedge: 0,
        iron4: 2,
        iron5: 1,
        iron6: 4,
        iron7: 2,
        iron8: 0,
        iron9: 0,
        lobWedge: 0,
        pitchingWedge: 0,
        putter: 0,
        sandWedge: 0,
        wedge52: 0,
        wedge56: 0,
        wedge60: 0,
        wood3: 2,
        wood5: 1,
      },
    };
    const response = await makeUpdateClubsApiRequest(clubsData);
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(200);
  });

  it("should create the clubs for the logged in user if no clubs are found", async () => {
    const expectedResponse = {
      success: true,
      data: {
        driver: 4,
        gapWedge: 0,
        iron4: 2,
        iron5: 1,
        iron6: 4,
        iron7: 2,
        iron8: 0,
        iron9: 0,
        lobWedge: 0,
        pitchingWedge: 0,
        putter: 0,
        sandWedge: 0,
        wedge52: 0,
        wedge56: 0,
        wedge60: 0,
        wood3: 2,
        wood5: 1,
      },
    };
    await deleteClubs({
      userId: golferId,
    });

    const response = await makeUpdateClubsApiRequest(clubsData);
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(200);
  });

  it("should validate club input values are integers", async () => {
    const expectedResponse = {
      success: false,
      data: {
        errors: {
          driver: ["The driver must be an integer."],
        },
      },
    };
    const data = {
      driver: "abc",
      wood3: 2,
    };

    await deleteClubs({
      userId: golferId,
    });

    const response = await makeUpdateClubsApiRequest(data);
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(400);
  });
});
