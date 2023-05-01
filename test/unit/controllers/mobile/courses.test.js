const jwt = require("jsonwebtoken");

const helper = require("../../../helper");
const mainHelper = require("../../../../common/helper");
const config = require("../../../../config/config");
const golfbertService = require("../../../../services/golfbert/golfbert");
const courseServices = require("../../../../services/mobile/courses");

const { logger } = require("../../../../logger");

let tokens, testOrganizationUserId;
const userIds = {};
const courseIds ={
    fullInfo: {
        id: 1,
        // mocks: () => {}
        getCourseFromDb: jest.fn().mockImplementation(() => {
            // Return a mock course object
            return {
                "pars": {
                    "courseid": 1,
                    "holeteeboxes": [
                        {
                        "holeid": 35097,
                        "holenumber": 1,
                        "color": "Blue",
                        "length": 307,
                        "par": 4,
                        "handicap": 15,
                        "teeboxtype": "Pro"
                        },
                    ],
                    "coursename": "Highland Park Golf Course"
                },
              };
        }),
        get_holes_by_courseId: jest.fn().mockImplementation(() => {
            // Return a mock course object
            return {
                "holes": {
                    "resources": [
                      {
                        "id": 35114,
                        "number": 18,
                        "courseid": 1,
                        "rotation": 2.75935513708,
                        "range": {
                          "x": {
                            "min": -86.7773401493,
                            "max": -86.7768672659
                          },
                          "y": {
                            "min": 33.5116383716,
                            "max": 33.5144876964
                          }
                        },
                        "dimensions": {
                          "width": 960,
                          "height": 960
                        },
                        "vectors": [
                          {
                            "type": "Flag",
                            "lat": 33.5142908079,
                            "long": -86.7771515250206
                          },
                          {
                            "type": "Blue",
                            "lat": 33.5116383716,
                            "long": -86.777151525
                          },
                          {
                            "type": "White",
                            "lat": 33.5120091997,
                            "long": -86.7772105886
                          },
                          {
                            "type": "Red",
                            "lat": 33.5124958199,
                            "long": -86.7771739585
                          }
                        ],
                        "flagcoords": {
                          "lat": 33.509177355340555,
                          "long": -86.77616217306682
                        }
                      }
                    ]
                  }
                }
        }),
        get_scorecard_by_courseId: jest.fn().mockImplementation(() => {
            // Return a mock course object
            return {
                "pars": {
                    "courseid": 1,
                    "holeteeboxes": [
                        {
                        "holeid": 35097,
                        "holenumber": 1,
                        "color": "Blue",
                        "length": 307,
                        "par": 4,
                        "handicap": 15,
                        "teeboxtype": "Pro"
                        },
                    ],
                    "coursename": "Highland Park Golf Course"
                },
              };
        }),
        expectedResponse: {
            "success": true,
            "data": {
              "pars": {
                "courseid": 1,
                "holeteeboxes": [
                  {
                    "holeid": 35097,
                    "holenumber": 1,
                    "color": "Blue",
                    "length": 307,
                    "par": 4,
                    "handicap": 15,
                    "teeboxtype": "Pro"
                  },
                ],
                "coursename": "Highland Park Golf Course"
              },
              "holes": {
                "resources": [
                  {
                    "id": 35114,
                    "number": 18,
                    "courseid": 1,
                    "rotation": 2.75935513708,
                    "range": {
                      "x": {
                        "min": -86.7773401493,
                        "max": -86.7768672659
                      },
                      "y": {
                        "min": 33.5116383716,
                        "max": 33.5144876964
                      }
                    },
                    "dimensions": {
                      "width": 960,
                      "height": 960
                    },
                    "vectors": [
                      {
                        "type": "Flag",
                        "lat": 33.5142908079,
                        "long": -86.7771515250206
                      },
                      {
                        "type": "Blue",
                        "lat": 33.5116383716,
                        "long": -86.777151525
                      },
                      {
                        "type": "White",
                        "lat": 33.5120091997,
                        "long": -86.7772105886
                      },
                      {
                        "type": "Red",
                        "lat": 33.5124958199,
                        "long": -86.7771739585
                      }
                    ],
                    "flagcoords": {
                      "lat": 33.509177355340555,
                      "long": -86.77616217306682
                    }
                  }
                ]
              }
            }
          }
    },
    notFoundGolfbertId: {
        id: 2,
        mockedResponse: {},
    },
    notFoundHolesInfo: {
        id: 3,
        mockedResponse: {},
    },
    notFoundParInfo: {
        id: 4,
        mockedResponse: {},
    },
    notFound: {
        id: 1000000,
        mockedResponse: {},
    },
}
jest.mock('../../../../services/mobile/courses', () => {
    const originalModule = jest.requireActual('../../../../services/mobile/courses');
  
    return {
      ...originalModule,
      getCourseFromDb: jest.fn()
      .mockImplementation(() => {
        // Return a mock course object
        return {
          id: 1,
          golfbertId: 1
        };
      })
      .mockImplementation(() => {
        // Return a mock course object
        return {
          id: 1,
          golfbertId: 1
        };
      })
      .mockImplementation(() => {
        // Return a mock course object
        return {
          id: 1000000,
          golfbertId: null
        };
      })
    };
});
jest.mock('../../../../services/golfbert/golfbert', () => {
    const originalModule = jest.requireActual('../../../../services/golfbert/golfbert');
  
    return {
      ...originalModule,
      get_holes_by_courseId: jest.fn().mockImplementation(() => {
        return {
            resources: [
                {
                    id: 35097,
                    number: 1,
                    courseid: 1,
                    rotation: -0.521295556472,
                    range: {},
                    dimensions: {},
                    vectors: [],
                    flagcoords: {}
                },
            ]
        };
      }),
      get_scorecard_by_courseId: jest.fn().mockImplementation(() => {
        return {
            courseid: 1,
            holeteeboxes: [
                {
                    holeid: 35097,
                    holenumber: 1,
                    color: 'Blue',
                    length: 307,
                    par: 4,
                    handicap: 15,
                    teeboxtype: 'Pro'
                },
            ],
            coursename: 'Highland Park Golf Course'
        };
      }),
    };
});
// const courseFromDB = await courseServices.getCourseFromDb({ id: courseId })
// const holesInfo = await golfbertService.get_holes_by_courseId(
// const parInfo = await golfbertService.get_scorecard_by_courseId(

describe.skip("mobile application courses for game play", () => {
    beforeAll(async () => {
        tokens = await helper.get_all_roles_tokens();
        userIds.testCustomer = jwt.verify(tokens.testCustomer, config.jwt.secret);
        userIds.superadmin = jwt.verify(tokens.superadmin, config.jwt.secret);
        userIds.admin = jwt.verify(tokens.admin, config.jwt.secret);
        userIds.zongCustomer = jwt.verify(tokens.zongCustomer, config.jwt.secret);
        userIds.testOperator = jwt.verify(tokens.testOperator, config.jwt.secret);

        testOrganizationUserId = userIds.testCustomer.id;
    });

    describe("[GET] /courses/{courseId}", () => {
        it("should allow guest user to access the api endpoint without token", async () => {
            const data = {
                endpoint: `courses/${courseIds.fullInfo.id}`,
            };
            const response = await helper.get_request(data);
            console.log(response.body.data.pars.courseid)
            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(expect.objectContaining({
                pars: expect.any(Object),
                holes: expect.any(Object),
            }))
        });

        it("should allow logged in to access the api endpoint", async () => {
            const data = {
                token: tokens.testCustomer,
                endpoint: `courses/${courseIds.fullInfo.id}`,
            };
            const response = await helper.get_request_with_authorization(data);
            expect(response.status).toBe(200);
            console.log(response.body.data.pars.courseid)
            expect(response.body.data).toEqual(expect.objectContaining({
                pars: expect.any(Object),
                holes: expect.any(Object),
            }))
        });

        it("should throw error if course is not found in database", async () => {
            const data = {
                token: tokens.testCustomer,
                endpoint: `courses/${courseIds.notFound.id}`,
            };
            const response = await helper.get_request_with_authorization(data);
            console.log(response.body.data.pars.courseid)
            expect(response.status).toBe(404);
            expect(response.body.data).toEqual("Course Not Found")
        });

        it("should throw error if course's golfbert id is not found in database", async () => {
            const data = {
                params: {
                orgId: Orgs.org1.id,
                role: "customer",
                email: email.nonExistingEmail2,
                },
                token: tokens.admin,
                endpoint: "user/invite-user",
            };
            const response = await helper.post_request_with_authorization(data);
            expect(response.status).toBe(200);
            expect(response.body.data.message).toBe("User Invited successfully");
        });

        it("should throw error if course's holes information is not found on golfbert", async () => {
            const data = {
                params: {
                orgId: Orgs.org1.id,
                role: "customer",
                email: email.nonExistingEmail2,
                },
                token: tokens.admin,
                endpoint: "user/invite-user",
            };
            const response = await helper.post_request_with_authorization(data);
            expect(response.status).toBe(200);
            expect(response.body.data.message).toBe("User Invited successfully");
        });

        it("should throw error if course's par information is not found on golfbert", async () => {
            const data = {
                params: {
                orgId: Orgs.org1.id,
                role: "customer",
                email: email.nonExistingEmail2,
                },
                token: tokens.admin,
                endpoint: "user/invite-user",
            };
            const response = await helper.post_request_with_authorization(data);
            expect(response.status).toBe(200);
            expect(response.body.data.message).toBe("User Invited successfully");
        });
    })


})