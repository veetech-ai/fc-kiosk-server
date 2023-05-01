const helper = require("../../../helper");
const config = require("../../../../config/config");
const { logger } = require("../../../../logger");
const jwt = require("jsonwebtoken");

describe("POST /api/v1/kiosk-courses/create", () => {
    // let organization;
    // beforeEach(async () => {
    //   // Create an organization for testing purposes
    //   organization = await models.Organization.create({
    //     name: "Test Organization",
    //     email: "test@example.com",
    //     phone: "1234567890",
    //   });
    // });
  
    // afterEach(async () => {
    //   // Delete the organization after each test
    //   await organization.destroy();
    // });
  
    it.only("should create a new course with valid input", async () => {
      const courseData = {
        name: "Test Course",
        state: "CA",
        city: "San Francisco",
        zip: "12345",
        phone: "555-1234",
        org_id: organization.id,
      };
      let admin_token = await helperTest.get_token_for("admin");
  
      // Mock the createCourse function of the courseService
      const resp = await helper.post_request_with_authorization({
        endpoint: "kiosk-courses/create",
        token: admin_token,
        params: {
            name: "Test Course",
            state: "CA",
            city: "San Francisco",
            zip: "12345",
            phone: "555-1234",
            org_id: 2,
        },
      });
  
      // Make the API request
     console.log("response is :",resp);
  
      // Verify the response
    //   expect(res.status).toEqual(200);
    //   expect(res.body.data).toEqual(courseData);
    });
  
    it("should return an error if organization does not exist", async () => {
      const courseData = {
        name: "Test Course",
        state: "CA",
        city: "San Francisco",
        zip: "12345",
        phone: "555-1234",
        org_id: 999, // Invalid organization ID
      };
  
      // Mock the createCourse function of the courseService
      courseService.createCourse = jest.fn().mockRejectedValue(new Error("Invalid organization ID:404"));
  
      // Make the API request
      const res = await request(app).post("/api/v1/kiosk-courses/create").send(courseData);
  
      // Verify the response
      expect(res.status).toEqual(404);
      expect(res.body.error).toEqual("Invalid organization ID");
    });
  
    it("should return an error if input validation fails", async () => {
      const courseData = {
        name: "Test Course",
        state: "CA",
        city: "San Francisco",
        phone: "555-1234",
        org_id: organization.id,
      };
  
      // Make the API request
      const res = await request(app).post("/api/v1/kiosk-courses/create").send(courseData);
  
      // Verify the response
      expect(res.status).toEqual(422);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.name).toBeDefined();
      expect(res.body.errors.zip).toBeDefined();
    });
  });

