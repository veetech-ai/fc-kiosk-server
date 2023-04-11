const {
  updateScreenBasedOnGroupId,
} = require("../../../../controllers/mqtt/helper");
const {
  get_by_where_single,
} = require("../../../../services/user_device_groups");
const { mqtt_publish_message } = require("../../../../common/helper.js");

jest.mock("../../../../services/user_device_groups", () => ({
  ...jest.requireActual("../../../../services/user_device_groups"),
  get_by_where_single: jest.fn(),
}));

jest.mock("../../../../common/helper.js", () => ({
  ...jest.requireActual("../../../../common/helper.js"),
  mqtt_publish_message: jest.fn(),
}));

describe("updateScreenBasedOnGroupId", () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });
  describe("Success", () => {
    it("should publish message if group is found", async () => {
      const orgId = 1;
      get_by_where_single.mockImplementation(({ id }) => {
        return { orgId, group_type: "automa" };
      });
      const action = {
        ts: 1645106445,
      };
      const channel = "screen";
      const groupId = 1;

      await updateScreenBasedOnGroupId({ action, channel, groupId });

      expect(get_by_where_single).toHaveBeenCalledWith({ id: groupId });

      expect(mqtt_publish_message).toHaveBeenCalledWith(
        `u/${orgId}/${channel}`,
        { action },
        false,
      );
    });
  });
  describe("Fail", () => {
    it("return without calling mqtt publish message function", async () => {
      get_by_where_single.mockImplementation(({ id }) => {
        return null;
      });
      const action = {};
      const channel = "screen";
      const groupId = 1;

      await updateScreenBasedOnGroupId({ action, channel, groupId });

      expect(get_by_where_single).toHaveBeenCalledWith({ id: groupId });

      expect(mqtt_publish_message).not.toHaveBeenCalled();
    });

    it("should catch exception and throw it again with Error class", async () => {
      get_by_where_single.mockImplementation(() => {
        throw new Error("Database connection error");
      });

      const action = {};
      const channel = "screen";
      const groupId = 1;

      try {
        await updateScreenBasedOnGroupId({ action, channel, groupId });
      } catch (error) {
        expect(error.message).toBe("Error: Database connection error");
      }
    });
  });
});
