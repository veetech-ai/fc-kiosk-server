const helper = require("../../../helper");
const models = require("../../../../models/index");
const jwt = require("jsonwebtoken");
const Course = models.Course;

describe("Post: /game", () => {
    let adminToken;
    let customerToken;
    let testManagerToken;
    let differentOrganizationCustomerToken;
    let golferToken;
    let testOrganizationId = 1;
    let createdCourses;

    beforeAll(async () => {
        // Create some courses for the test organization
        const courses = [
          {
            name: "Course 1",
            city: "Test City 1",
            state: "Test State 1",
            org_id: testOrganizationId,
          },
          {
            name: "Course 2",
            city: "Test City 2",
            state: "Test State 2",
            org_id: testOrganizationId,
          },
          {
            name: "Course 3",
            city: "Test City 3",
            state: "Test State 3",
            org_id: testOrganizationId,
          },
        ];
    
        createdCourses = await Course.bulkCreate(courses);
        adminToken = await helper.get_token_for("admin");
        customerToken = await helper.get_token_for("testCustomer");
        testManagerToken = await helper.get_token_for("testManager");
        golferToken = await helper.get_token_for("golfer");
        console.log({golferToken});
        differentOrganizationCustomerToken = await helper.get_token_for(
          "zongCustomer",
        );

        // console.log(createdCourses);
      });
    

    it("should create the game successfully", async () => {
      const user = jwt.decode(golferToken);
      const params = {
        mcId: createdCourses[0].id,
        totalIdealShots: 5,
        teeColor: 'red',
      };
      const expectedResponse = {
        mcId: createdCourses[0].id,
        totalIdealShots: 5,
        teeColor: "red",
        ownerId: user.id,
        participantId: user.id,
        participantName: user.name,
        orgId: user.orgId,
      }
// expect.any(Object)

      const response = await helper.post_request_with_authorization({
        endpoint: "game",
        token: golferToken,
        params: params,
      });

      expect(response.body.data).toEqual(expect.objectContaining(expectedResponse));
      expect(response.status).toBe(200);
    })
})