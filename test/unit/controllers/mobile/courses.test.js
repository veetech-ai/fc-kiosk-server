const jwt = require("jsonwebtoken");

const helper = require("../../../helper");
const mainHelper = require("../../../../common/helper");
const config = require("../../../../config/config");
const golfbertService = require("../../../../services/golfbert/golfbert");
const courseServices = require("../../../../services/mobile/courses");

const { logger } = require("../../../../logger");

let tokens;
const userIds = {};


const getCourseFromDbSpy =  jest.spyOn(courseServices, "getCourseFromDb").mockImplementation(async ({ id }) => {
    return {
        id: id,
        golfbertId: id
    }
})
const get_holes_by_courseIdSpy =  jest.spyOn(golfbertService, "get_holes_by_courseId").mockImplementation(async (golfBertCourseId) => {
    return {
        resources: [
            {
                id: 35097,
                number: 1,
                rotation: -0.521295556472,
            },
        ]
    }
})
const get_scorecard_by_courseIdSpy =  jest.spyOn(golfbertService, "get_scorecard_by_courseId").mockImplementation(async (golfBertCourseId) => {
    return {
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
    }
})

describe("mobile application courses for game play", () => {
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
                endpoint: `courses/1`,
            };
            const response = await helper.get_request(data);
    
            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(expect.objectContaining({
                pars: expect.any(Object),
                holes: expect.any(Object),
            }))
        });

        it("should allow logged in to access the api endpoint", async () => {
            const data = {
                token: tokens.testCustomer,
                endpoint: `courses/1`,
            };
            const response = await helper.get_request_with_authorization(data);
            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(expect.objectContaining({
                pars: expect.any(Object),
                holes: expect.any(Object),
            }))
        });

        it("should throw error if course is not found in database", async () => {
            getCourseFromDbSpy.mockImplementation(async ({ id }) => {
                throw new Error (`Course Not Found${config.error_message_separator}404`)
            })
            const data = {
                token: tokens.testCustomer,
                endpoint: `courses/1`,
            };
            const response = await helper.get_request_with_authorization(data);
            expect(response.status).toBe(404);
            expect(response.body.data).toEqual("Course Not Found")
        });

        it("should throw error if course's golfbert id is not found in database", async () => {
            getCourseFromDbSpy.mockImplementation(async ({ id }) => {
                throw new Error (`Course's Golfbert Id Not Found${config.error_message_separator}404`)
            })
            const data = {
                token: tokens.testCustomer,
                endpoint: "courses/1",
            };
            const response = await helper.get_request_with_authorization(data);
            expect(response.status).toBe(404);
            expect(response.body.data).toEqual("Course's Golfbert Id Not Found");
        });

        it("should throw error if course's holes information is not found on golfbert", async () => {
            getCourseFromDbSpy.mockImplementation(async ({ id }) => {
                return {
                    id: id,
                    golfbertId: id
                }
            })
            get_holes_by_courseIdSpy.mockImplementation(async (golfBertCourseId) => {
                throw new Error (`This course is coming soon${config.error_message_separator}404`)
            })
            const data = {
                token: tokens.testCustomer,
                endpoint: "courses/1",
            };
            const response = await helper.get_request_with_authorization(data);
            expect(response.status).toBe(404);
            expect(response.body.data).toEqual("This course is coming soon");
        });

        it("should throw error if course's par information is not found on golfbert", async () => {
            getCourseFromDbSpy.mockImplementation(async ({ id }) => {
                return {
                    id: id,
                    golfbertId: id
                }
            })
            get_holes_by_courseIdSpy.mockImplementation(golfbertService, "get_holes_by_courseId").mockImplementation(async (golfBertCourseId) => {
                return {
                    resources: [
                        {
                            id: 35097,
                            number: 1,
                            rotation: -0.521295556472,
                        },
                    ]
                }
            })
            get_scorecard_by_courseIdSpy.mockImplementation(async (golfBertCourseId) => {
                throw new Error(`ERROR`)
            })
            const data = {
                token: tokens.testCustomer,
                endpoint: "courses/1",
            };
            const response = await helper.get_request_with_authorization(data);
            expect(response.status).toBe(500);
            expect(response.body.data).toEqual("ERROR");
        });
    })
})