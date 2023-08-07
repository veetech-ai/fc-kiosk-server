// const helper = require("../../../../helper");
// const upload_file = require("../../../../../common/upload");

// describe("POST /events", () => {
//   jest
//     .spyOn(upload_file, "upload_file")
//     .mockImplementation(() => Promise.resolve("mock-logo-url"));

//   let mockFields;
//   let mockFiles;
//   jest.mock("formidable", () => {
//     return {
//       IncomingForm: jest.fn().mockImplementation(() => {
//         return {
//           multiples: true,
//           parse: (req, cb) => {
//             cb(null, mockFields, mockFiles);
//           },
//         };
//       }),
//     };
//   });

//   const requestBody = {
//     fields: {
//       title: "Deduction Event",
//       gcId: 1,
//       openingTime: "10:00",
//       closingTime: "14:00",
//       address: "Location Unknown",
//       description:
//         "A event that is unique, happeining right in your neighborhood. So never miss a chance to get, what is yours",
//       details: `
//       <div>
//         <p>Discover an extraordinary event that is unlike any other, and it's taking place right in your own neighborhood. This remarkable gathering promises an experience that you won't find anywhere else.</p>
//         <p>Immerse yourself in a world of captivating activities, live entertainment, and interactive exhibits that will leave you inspired and amazed. Whether you're a passionate enthusiast or just curious, this event caters to all interests and ages.</p>
//         <p>Mark your calendar for the upcoming dates, and make sure not to miss out on this fantastic opportunity to be a part of something truly special. Join your neighbors and fellow community members as you embark on a journey of exploration and enjoyment.</p>
//         <p>Remember, opportunities like these are rare, so seize the moment to claim what rightfully belongs to you. Your presence at this event could lead to unforgettable memories and meaningful connections.</p>
//         <p>Don't hesitate, don't delay. Embrace the chance to embrace what is yours. We look forward to welcoming you to this unique event that's tailor-made for you and your neighborhood.</p>
//       </div>
//       `,
//     },
//     files: {
//       thumbnail: {
//         name: "mock-logo.png",
//         type: "image/png",
//         size: 5000, // bytes
//         path: "/mock/path/to/logo.png",
//       },
//       corousal: [
//         {
//           name: "mock-logo.png",
//           type: "image/png",
//           size: 5000, // bytes
//           path: "/mock/path/to/logo.png",
//         },
//         {
//           name: "mock-logo.png",
//           type: "image/png",
//           size: 5000, // bytes
//           path: "/mock/path/to/logo.png",
//         },
//         {
//           name: "mock-logo.png",
//           type: "image/png",
//           size: 5000, // bytes
//           path: "/mock/path/to/logo.png",
//         },
//       ],
//     },
//   };

//   let adminToken = "";
//   const endpoint = "events";

//   beforeAll(async () => {
//     adminToken = await helper.get_token_for("admin");
//   });

//   describe("Success", () => {
//     it("should create an event in database", async () => {
//       mockFields = requestBody.fields;
//       mockFiles = requestBody.files;
//       const event = await helper.post_request_with_authorization({
//         endpoint: "events",
//         token: adminToken,
//         params: requestBody.fields,
//       });

//       expect(event.body).toEqual({
//         success: true,
//         data: {
//           description: expect.any(String),
//           details: expect.any(String),
//           id: 2,
//           title: requestBody.fields.title,
//           gcId: requestBody.fields.gcId,
//           openingTime: requestBody.fields.openingTime,
//           closingTime: requestBody.fields.closingTime,
//           address: requestBody.fields.address,
//           imageUrl: expect.any(URL),
//           corousal: [expect.any(URL), expect.any(URL), expect.any(URL)],
//           updatedAt: expect.any(Date),
//           createdAt: expect.any(Date),
//         },
//       });
//     });
//   });

//   describe("Failure", () => {
//     it("should throw error if title is empty", async () => {
//       mockFields = requestBody.fields;
//       mockFiles = requestBody.files;

//       const _fields = { ...requestBody.fields };
//       delete _fields["title"];

//       const event = await helper.post_request_with_authorization({
//         endpoint: "events",
//         token: adminToken,
//         params: requestBody.fields,
//       });

//       expect(event.body).toEqual({
//         success: false,
//         data: "title is requireds",
//       });
//     });

//     it("should throw error if gcId is empty", async () => {
//       mockFields = requestBody.fields;
//       mockFiles = requestBody.files;

//       const _fields = { ...requestBody.fields };
//       delete _fields["gcId"];

//       const event = await helper.post_request_with_authorization({
//         endpoint: "events",
//         token: adminToken,
//         params: requestBody.fields,
//       });

//       expect(event.body).toEqual({
//         success: false,
//         data: "gcId is required",
//       });
//     });

//     it("should throw error if address is empty", async () => {
//       mockFields = requestBody.fields;
//       mockFiles = requestBody.files;

//       const _fields = { ...requestBody.fields };
//       delete _fields["address"];

//       const event = await helper.post_request_with_authorization({
//         endpoint: "events",
//         token: adminToken,
//         params: requestBody.fields,
//       });

//       expect(event.body).toEqual({
//         success: false,
//         data: "address is required",
//       });
//     });

//     it("should throw error if openingTime is empty", async () => {
//       mockFields = requestBody.fields;
//       mockFiles = requestBody.files;

//       const _fields = { ...requestBody.fields };
//       delete _fields["openingTime"];

//       const event = await helper.post_request_with_authorization({
//         endpoint: "events",
//         token: adminToken,
//         params: requestBody.fields,
//       });

//       expect(event.body).toEqual({
//         success: false,
//         data: "openingTime is required",
//       });
//     });

//     it("should throw error if closingTime is empty", async () => {
//       mockFields = requestBody.fields;
//       mockFiles = requestBody.files;

//       const _fields = { ...requestBody.fields };
//       delete _fields["closingTime"];

//       const event = await helper.post_request_with_authorization({
//         endpoint: "events",
//         token: adminToken,
//         params: requestBody.fields,
//       });

//       expect(event.body).toEqual({
//         success: false,
//         data: "closingTime is required",
//       });
//     });
//   });
// });
