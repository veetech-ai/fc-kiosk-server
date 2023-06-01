const helper = require("../../../helper");
const models = require("../../../../models/index");
const config = require("../../../../config/config");
const jwt = require("jsonwebtoken");
const Course = models.Course;

describe("Post: /game", () => {
    let golferToken;
    let createdCourses;
    let golferUser;
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
    ]

    beforeAll(async () => {
        // Create some courses for the test organization
        
        golferToken = await helper.get_token_for("golfer");
        golferUser = jwt.decode(golferToken);
        
        const courses = [
          {
            name: "Course 1",
            city: "Test City 1",
            state: "Test State 1",
            org_id: golferUser.orgId,
          },
          {
            name: "Course 2",
            city: "Test City 2",
            state: "Test State 2",
            org_id: golferUser.orgId,
          },
          {
            name: "Course 3",
            city: "Test City 3",
            state: "Test State 3",
            org_id: golferUser.orgId,
          },
        ];

        createdCourses = await Course.bulkCreate(courses);
      });

    describe("Success", () => {
      it("should create the game successfully when parameters are valid", async () => {
        const params = {
          mcId: createdCourses[0].id,
          totalIdealShots: 5,
          teeColor: 'Red',
          holes
        };
        const expectedResponse = {
          mcId: createdCourses[0].id,
          totalIdealShots: 5,
          teeColor: "Red",
          ownerId: golferUser.id,
          participantId: golferUser.id,
          participantName: golferUser.name,
          orgId: golferUser.orgId,
        }
  
        const response = await helper.post_request_with_authorization({
          endpoint: "game",
          token: golferToken,
          params: params,
        });
  
        expect(response.body.data).toEqual(expect.objectContaining(expectedResponse));
        expect(response.status).toBe(200);
      })
    })
    describe("Fail", () => {
      it("should fail if course does not exist", async () => {
        const wrongCourseId = -1;
        const params = {
          mcId: wrongCourseId,
          totalIdealShots: 5,
          teeColor: 'Red',
          holes
        };
  
        const response = await helper.post_request_with_authorization({
          endpoint: "game",
          token: golferToken,
          params: params,
        });
  
        expect(response.body.data).toEqual(`Course Not Found${config.error_message_separator}404`);
      })
      it("should fail if total ideal shots are invalid", async () => {
        const params = {
          mcId: createdCourses[0].id,
          totalIdealShots: -5,
          teeColor: 'Red',
          holes
        };
        const expectedResponse = {
          success: false,
          data: expect.any(Object) 
        }

  
        const response = await helper.post_request_with_authorization({
          endpoint: "game",
          token: golferToken,
          params: params,
        });
        
        expect(response.body).toEqual(expect.objectContaining(expectedResponse));
        expect(response.body.data.errors.totalIdealShots).toEqual(["The totalIdealShots must be at least 1."]);
        expect(response.statusCode).toEqual(400);
      })

      it("should fail if tee color is not string", async () => {
        const params = {
          mcId: createdCourses[0].id,
          totalIdealShots: 5,
          teeColor: 321,
          holes
        };
        const expectedResponse = {
          success: false,
          data: expect.any(Object) 
        }

  
        const response = await helper.post_request_with_authorization({
          endpoint: "game",
          token: golferToken,
          params: params,
        });
        
        expect(response.body).toEqual(expect.objectContaining(expectedResponse));
        expect(response.body.data.errors.teeColor).toEqual(['The teeColor must be a string.']);
        expect(response.statusCode).toEqual(400);
      })

      it("should fail if hole array is empty", async () => {
        const params = {
          mcId: createdCourses[0].id,
          totalIdealShots: 5,
          teeColor: "Red",
          holes: []
        };
        const expectedResponse = {
          success: false,
          data: expect.any(Object) 
        }
  
        const response = await helper.post_request_with_authorization({
          endpoint: "game",
          token: golferToken,
          params: params,
        });
        
        expect(response.body).toEqual(expect.objectContaining(expectedResponse));
        expect(response.body.data.errors.holes).toEqual(['The holes field is required.']);
        expect(response.statusCode).toEqual(400);
      })
    })
})