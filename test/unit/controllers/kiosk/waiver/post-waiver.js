// const { uuid } = require("uuidv4");
// const helper = require("../../../../helper");
// const awsS3 = require("../../../../../common/external_services/aws-s3");

// const models = require("../../../../../models");
// const serverUpload = require("../../../../../common/server_upload");

// const { Course, Waiver } = models;

// let mockFields,
//   mockFiles,
//   testCourse,
//   testCourse2,
//   testCourse3,
//   testWaiver,
//   adminToken = null;

// jest.mock("formidable", () => {
//   return {
//     IncomingForm: jest.fn().mockImplementation(() => {
//       return {
//         multiples: true,
//         parse: (req, cb) => {
//           cb(null, mockFields, mockFiles);
//         },
//       };
//     }),
//   };
// });

// awsS3.uploadFile = jest.fn(() => Promise.resolve(uuid()));
// serverUpload.upload = jest.fn(() => Promise.resolve(uuid()));

// const MAX_ALLOWED_IMAGE_SIZE = 5000;

// const testWaiverPayload = {
//   name: "Renting Agreement",
//   content: `
//     <h2>Agreement</h2>
//     <p>This Agreement ("Agreement") is made and entered into between:</p>

//     <p><strong>Party A:</strong> [Name of Party A]</p>
//     <p><strong>Party B:</strong> [Name of Party B]</p>

//     <p><strong>Date:</strong> [Date of Agreement]</p>

//     <p><strong>Terms and Conditions:</strong></p>
//     <p>[Brief description of the terms and conditions of the agreement. For example: Party A agrees to provide services to Party B in exchange for payment. Party B agrees to pay Party A in accordance with the agreed-upon schedule.]</p>

//     <p><strong>Termination:</strong></p>
//     <p>[Brief description of the termination clause. For example: Either party may terminate this Agreement by providing written notice to the other party at least [number] days in advance.]</p>

//     <p><strong>Governing Law:</strong></p>
//     <p>[Specify the governing law and jurisdiction for any legal disputes. For example: This Agreement shall be governed by and construed in accordance with the laws of [Country/State]. Any disputes arising under or in connection with this Agreement shall be subject to the exclusive jurisdiction of the courts of [Country/State].]</p>

//     <p><strong>Entire Agreement:</strong></p>
//     <p>[Statement confirming that this Agreement constitutes the entire agreement between the parties and supersedes any previous understandings or agreements.]</p>

//     <p>This Agreement is executed on the date first above written.</p>

//     <p><strong>Party A:</strong></p>
//     <p>_______________________________</p>

//     <p><strong>Party B:</strong></p>
//     <p>_______________________________</p>`,
// };

// const signingData = {
//   files: {
//     signature: {
//       name: "signature.png",
//       type: "image/png",
//       size: MAX_ALLOWED_IMAGE_SIZE, // bytes
//       path: "/mock/path/to/signature.png",
//     },
//   },
//   fields: {
//     email: "user@email.com",
//   },
// };

// const coursePayload = {
//   name: "Test course",
//   state: "Test State",
//   city: "Test city",
//   orgId: 1,
// };

// const coursePayload2 = {
//   name: "Test course 2 ",
//   state: "Test State 2",
//   city: "Test city 2",
//   orgId: 1,
// };

// const makePostRequest = (options = signingData) => {
//   const { fields, files } = options;
//   mockFields = fields;
//   mockFiles = files;

//   return helper.post_request_with_authorization({
//     endpoint: "waiver/sign",
//     token: adminToken,
//     params: signingData.fields,
//     fileupload: true,
//   });
// };

// describe("PATCH /waiver", () => {
//   beforeAll(async () => {
//     adminToken = await helper.get_token_for("admin");

//     // create course 1
//     testCourse = await helper.post_request_with_authorization({
//       endpoint: "kiosk-courses",
//       token: adminToken,
//       params: coursePayload,
//     });

//     testCourse = testCourse.body.data;

//     // assign course ids to signing payload
//     signingData.fields.gcId = testCourse.id;

//     // create a waiver
//     testWaiverPayload.gcId = testCourse.id;
//     testWaiver = await Waiver.create(testWaiverPayload);

//     // create course 2
//     testCourse2 = await helper.post_request_with_authorization({
//       endpoint: "kiosk-courses",
//       token: adminToken,
//       params: coursePayload2,
//     });

//     testCourse2 = testCourse2.body.data;

//     // create course 3
//     testCourse3 = await helper.post_request_with_authorization({
//       endpoint: "kiosk-courses",
//       token: adminToken,
//       params: {
//         name: "Test course 3",
//         state: "Test State",
//         city: "Test city",
//         orgId: 1,
//       },
//     });

//     testCourse3 = testCourse3.body.data;
//   });

//   afterAll(async () => {
//     await Promise.all([
//       Course.destroy({ where: { id: testCourse.id } }),
//       Course.destroy({ where: { id: testCourse2.id } }),
//       Course.destroy({ where: { id: testCourse3.id } }),
//       Waiver.destroy({ where: { id: testWaiver.id } }),
//     ]);
//   });

//   describe("success", () => {
//     it.only("should create new waiver signing entry", async () => {
//       const res = await makePostRequest(signingData);

//       expect(res.statusCode).toEqual(201);

//       expect(res.body.success).toEqual(true);
//       expect(res.body.data.id).toEqual(expect.any(Number));
//       expect(res.body.data.email).toEqual(signingData.fields.email);

//       expect(() => new URL(res.body.data.pdf)).not.toThrowError();
//     });

//     it("should allow a user to sign the waiver again if the waiver has been updated, since user last time signed", async () => {
//       const newContent = `
//       <main>
//           <h2>Agreement</h2>
//           <p>This Agreement ("Agreement") is made between:</p>

//           <p><strong>Party A:</strong> [Name of Party A]</p>
//           <p><strong>Party B:</strong> [Name of Party B]</p>

//           <p><strong>Date:</strong> [Date of Agreement]</p>

//           <p><strong>Terms:</strong> [Brief description of terms.]</p>

//           <p><strong>Termination:</strong> [Termination clause.]</p>

//           <p><strong>Governing Law:</strong> [Governing law and jurisdiction.]</p>

//           <p>This Agreement is the entire agreement between the parties.</p>

//           <p><strong>Party A:</strong> ___________________________</p>
//           <p><strong>Party B:</strong> ___________________________</p>
//       </main>
//       `;

//       await Waiver.update(
//         { content: newContent },
//         { where: { id: testWaiver.id } },
//       );

//       const res = await makePostRequest();

//       expect(res.statusCode).toEqual(201);

//       expect(res.body.success).toEqual(true);
//       expect(res.body.data.id).toEqual(expect.any(Number));
//       expect(res.body.data.email).toEqual(signingData.fields.email);

//       expect(() => new URL(res.body.data.signature)).not.toThrowError();
//     });

//     it("should send message without any update if user with a email has already signed the waiver for a golf course", async () => {
//       const testWaiver = await Waiver.create({
//         name: "Another Renting Agreement",
//         content: testWaiverPayload.content,
//         gcId: testCourse2.id,
//       });

//       signingData.fields.gcId = testCourse2.id;

//       const res = await makePostRequest();

//       expect(res.body).toEqual({
//         success: true,
//         data: "You've already signed the waiver.",
//       });
//       expect(res.statusCode).toEqual(200);

//       Waiver.destroy({ where: { id: testWaiver.id } });
//     });
//   });

//   describe("failure", () => {
//     it("should throw error if gcId is not provided", async () => {
//       const res = await makePostRequest({
//         fields: { email: signingData.fields.email },
//       });

//       expect(res.body).toEqual({
//         success: false,
//         data: "The gcId field id required.",
//       });
//       expect(res.statusCode).toEqual(400);
//     });

//     it("should throw error if gcId is not valid number", async () => {
//       const res = await makePostRequest({
//         fields: { email: signingData.fields.email, gcId: "wrong id" },
//       });

//       expect(res.body).toEqual({
//         success: false,
//         data: "The gcId must be an integer.",
//       });
//       expect(res.statusCode).toEqual(400);
//     });

//     it("should throw error if email is not provided", async () => {
//       const res = await makePostRequest({
//         fields: { email: signingData.fields.email },
//       });

//       expect(res.body).toEqual({
//         success: false,
//         data: "The email field is required.",
//       });
//       expect(res.statusCode).toEqual(400);
//     });

//     it("should throw error if email is not a valid email address", async () => {
//       const res = await makePostRequest({
//         fields: { email: "wrong email.com", gcId: testCourse.id },
//       });

//       expect(res.body).toEqual({
//         success: false,
//         data: "The email format is invalid.",
//       });
//       expect(res.statusCode).toEqual(400);
//     });

//     it("should throw error if signature image file is not provided", async () => {
//       const res = await makePostRequest({ files: null });

//       expect(res.body).toEqual({
//         success: false,
//         data: "The signature image is required.",
//       });
//       expect(res.statusCode).toEqual(400);
//     });

//     it("should throw error if signature image file is not in a allowed image format", async () => {
//       const res = await makePostRequest({
//         files: {
//           signature: {
//             name: "mock-logo.svg",
//             type: "image/svg",
//             size: MAX_ALLOWED_IMAGE_SIZE, // bytes
//             path: "/mock/path/to/logo.svg",
//           },
//         },
//       });

//       expect(res.body).toEqual({
//         success: false,
//         data: "Only jpg, jpeg, png, webp files are allowed",
//       });
//       expect(res.statusCode).toEqual(400);
//     });

//     it("should throw error if signature image file is bigger than allowed size", async () => {
//       const res = await makePostRequest({
//         files: {
//           signature: {
//             name: "mock-logo.png",
//             type: "image/png",
//             size: MAX_ALLOWED_IMAGE_SIZE + 5, // bytes
//             path: "/mock/path/to/logo.png",
//           },
//         },
//       });

//       expect(res.body).toEqual({
//         success: false,
//         data: "The signature image is bigger than allowed size",
//       });
//       expect(res.statusCode).toEqual(400);
//     });

//     it("should throw error if there's not waiver agianst particular golf course", async () => {
//       signingData.fields.gcId = testCourse3.id;
//       const res = await makePostRequest();

//       expect(res.body).toEqual({
//         success: false,
//         data: `No waiver found against gcId ${testCourse3.id}`,
//       });
//       expect(res.statusCode).toEqual(404);
//     });
//   });
// });
