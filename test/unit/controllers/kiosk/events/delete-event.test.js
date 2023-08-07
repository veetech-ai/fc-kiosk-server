const helper = require("../../../../helper");
const upload_file = require("../../../../../common/upload");

describe("DELETE /events", () => {
  let mockFields = null;
  let mockFiles = null;

  jest
    .spyOn(upload_file, "uploadImageForCourse")
    .mockImplementation(() => Promise.resolve("mock-logo-url"));

  jest.mock("formidable", () => {
    return {
      IncomingForm: jest.fn().mockImplementation(() => {
        return {
          multiples: true,
          parse: (req, cb) => {
            cb(null, mockFields, mockFiles);
          },
        };
      }),
    };
  });

  const requestBody = {
    fields: {
      state: "Alabama",
      title: "Main Ad",
    },
    files: {
      adImage: {
        name: "mock-logo.png",
        type: "image/png",
        size: 5000, // bytes
        path: "/mock/path/to/logo.png",
      },
    },
  };

  const mockFormidable = (fields, files) => {
    mockFields = fields;
    mockFiles = files;
  };

  let adminToken = "";

  beforeAll(async () => {
    adminToken = await helper.get_token_for("admin");
  });

  describe("Success", () => {
    // create new event
  });
  describe("Failure", () => {});
});
