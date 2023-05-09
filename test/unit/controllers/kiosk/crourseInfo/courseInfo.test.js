const helper = require("../../../../helper");
const upload_file = require("../../../../../common/upload");
describe("PATCH /api/v1/kiosk-courses/{courseId}/course-info", () => {
  let adminToken;
  let courseId;
  let testOrganizationId = 1;
  beforeAll(async () => {
    adminToken = await helper.get_token_for("admin");
    customerToken = await helper.get_token_for("testCustomer");
  });

  beforeAll(async () => {
    // Create some courses for the test organization
    const courses = {
      name: "Course 1",
      city: "Test City 1",
      state: "Test State 1",
      orgId: testOrganizationId,
    };

    adminToken = await helper.get_token_for("admin");
    const course = await helper.post_request_with_authorization({
      endpoint: "kiosk-courses/create",
      token: adminToken,
      params: courses,
    });
    courseId = course.body.data.id;
  });
  const makeApiRequest = async (courseId, params, logoImages, courseImages, token = adminToken) => {
    const logo = await upload_file.uploadLogoImage(logoImages, courseId, 3);
    const images = await upload_file.uploadCourseImage(courseImages, courseId, 3);
  
    const extendedParams = {
      ...params,
      logo,
      images,
    };
  
    return helper.patch_request_with_authorization({
      endpoint: `kiosk-courses/${courseId}/course-info`,
      token: token,
      params: extendedParams,
    });
  };

  it.only("should create a new course info with valid input", async () => {
    const params = {
      name: "Sedona Golf Club Exclusive",
      holes: 18,
      par: 12,
      length: "12",
      slope: 12,
      content: "",
    };
    const logoImages = {
        name: 'mock-logo.png',
        type: 'image/png',
        size: 5000, // bytes
        path: '/mock/path/to/logo.png',
      };
      
      const courseImages = [
        {
          name: 'mock-course-image1.png',
          type: 'image/png',
          size: 5000, // bytes
          path: '/mock/path/to/course-image1.png',
        },
        {
          name: 'mock-course-image2.png',
          type: 'image/png',
          size: 5000, // bytes
          path: '/mock/path/to/course-image2.png',
        },
      ];
      
    jest.spyOn(upload_file, 'uploadLogoImage').mockImplementation(() => Promise.resolve('mock-logo-url'));
    jest.spyOn(upload_file, 'uploadCourseImage').mockImplementation(() => Promise.resolve('mock-images-url'));
    const response = await makeApiRequest(courseId,logoImages,courseImages, params);
    console.log("respponse is :",response.body);
    // expect(response.body.data).toMatchObject(validCourseData);
  });

  //   it("should return expected response if organization does not exist", async () => {
  //     const invalidOrgIdData = { ...paramsCourseData, orgId: 999 };
  //     const response = await makeApiRequest(invalidOrgIdData);
  //     expect(response.body.data).toEqual("Organization not found");
  //     expect(response.status).toEqual(200);
  //   });

  //   it("should return an error if input validation fails", async () => {
  //     const invalidPhoneData = { ...paramsCourseData, phone: 555 - 1234 };
  //     const response = await makeApiRequest(invalidPhoneData);

  //     expect(response.body.data.errors).toEqual({
  //       phone: ["The phone must be a string."],
  //     });
  //   });
  //   it("should return an error if user is not authorized", async () => {
  //     const invalidPhoneData = { ...paramsCourseData, phone: 555 - 1234 };
  //     const response = await makeApiRequest(invalidPhoneData, customerToken);

  //     expect(response.body.data).toEqual("You are not allowed");
  //   });
});
