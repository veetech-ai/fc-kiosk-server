const { uuid } = require("uuidv4");
const helper = require("../../helper");
const helperCommon = require("../../../common/helper");

const { products } = require("../../../common/products");
const models = require("../../../models");
const OrganizationServices = require("../../../services/organization");
const { logger } = require("../../../logger");
const Device = models.Device;
const Organization_Device_Groups_Items =
  models.Organization_Device_Groups_Items;
const GroupHistoryModel = require("../../../services/group_history");

helper.set_mqtt_connection_lost_log = jest.fn();
helper.mqtt_publish_message = jest.fn();

let testOrganizationId = null;
let zongOrganizationId = null;

const getOrganizations = async (token) => {
  const response = await helper.get_request_with_authorization({
    endpoint: "organization/getAllOrganizations",
    token,
  });
  return response.body.data;
};
const setOrganizationsIds = async (organizations) => {
  organizations.forEach((element) => {
    if (element.name == "Test") testOrganizationId = element.id;
    if (element.name == "Zong") zongOrganizationId = element.id;
  });
};

const createNewDevices = async (token) => {
  const serial = uuid();
  const response = await helper.post_request_with_authorization({
    endpoint: "device/create",
    token,
    params: {
      device_type: products.kiosk.id,
      serial,
      pin_code: "1111",
    },
  });
  const device = response.body.data;
  return device;
};

const createNewGroup = async (token, orgId = null) => {
  const response = await helper.post_request_with_authorization({
    endpoint: "group/create",
    token,
    params: {
      name: "New test group",
      ...(orgId ? { orgId } : null),
    },
  });
  const group = response.body.data;
  return group;
};

const attachDeviceToGroup = async (token, groupId, deviceIds) => {
  const data = {
    token: token,
    endpoint: `group/attach-devices`,
    params: {
      group_id: groupId,
      device_ids: deviceIds,
    },
  };
  return (await helper.post_request_with_authorization(data)).body.data;
};

describe("group", () => {
  let tokens;

  beforeAll(async () => {
    tokens = await helper.get_all_roles_tokens();
    global.mqtt_connection_ok = true;
    global.mqtt_client_id = "";
    jest.spyOn(helperCommon, "mqtt_publish_message");
  });

  describe("Post /group/create", () => {
    let devices = [];
    let testOrg = null;

    beforeAll(async () => {
      const organizations = await getOrganizations(tokens.superadmin);
      setOrganizationsIds(organizations);
      if (!testOrganizationId || !zongOrganizationId)
        throw new Error(
          "Something bad happened while getting/setting the organizations ids",
        );
      devices[0] = await createNewDevices(tokens.superadmin);
      devices[1] = await createNewDevices(tokens.superadmin);
      testOrg = await OrganizationServices.findByName("Test");
    });

    describe("Success", () => {
      it("Should create new group when login with customer", async () => {
        const data = {
          token: tokens.testCustomer,
          endpoint: "group/create",
          params: {
            name: "New test group",
          },
        };
        const expectedResponseKeys = [
          "id",
          "schedule_id",
          "orgId",
          "name",
          "status",
          "mqtt_token",
          "fv",
          "createdAt",
          "updatedAt",
          "Organization_Device_Groups_Items",
        ];
        const response = await helper.post_request_with_authorization(data);
        expect(Object.keys(response.body.data)).toStrictEqual(
          expectedResponseKeys,
        );
        expect(response.body.data.orgId).not.toBe(null);
        expect(response.status).toBe(200);
        expect(response.body.data).not.toBe(null);
      });
      it("Should create new group when login with superAdmin", async () => {
        const data = {
          token: tokens.superadmin,
          endpoint: "group/create",
          params: {
            name: "New test group",
            orgId: testOrganizationId,
          },
        };
        const expectedResponseKeys = [
          "id",
          "schedule_id",
          "orgId",
          "name",
          "status",
          "mqtt_token",
          "fv",
          "createdAt",
          "updatedAt",
          "Organization_Device_Groups_Items",
        ];
        const response = await helper.post_request_with_authorization(data);
        expect(Object.keys(response.body.data)).toStrictEqual(
          expectedResponseKeys,
        );
        expect(response.body.data.orgId).toBe(testOrganizationId);
        expect(response.status).toBe(200);
      });
      it("Should create new group for a organization when login with superAdmin", async () => {
        const data = {
          token: tokens.superadmin,
          endpoint: "group/create",
          params: {
            name: "New test group",
            orgId: testOrg.id,
          },
        };
        const expectedResponseKeys = [
          "id",
          "schedule_id",
          "orgId",
          "name",
          "status",
          "mqtt_token",
          "fv",
          "createdAt",
          "updatedAt",
          "Organization_Device_Groups_Items",
        ];
        const response = await helper.post_request_with_authorization(data);
        expect(Object.keys(response.body.data)).toStrictEqual(
          expectedResponseKeys,
        );
        expect(response.body.data.orgId).toBe(testOrg.id);
        expect(response.status).toBe(200);
      });
      it("Should create new group and attach devices when login with superAdmin", async () => {
        const data = {
          token: tokens.superadmin,
          endpoint: "group/create",
          params: {
            name: "Group with attach devices",
            device_ids: `${devices[0]?.id},${devices[1]?.id}`,
            orgId: testOrganizationId,
          },
        };
        const expectedResponseKeys = [
          "id",
          "schedule_id",
          "orgId",
          "name",
          "status",
          "mqtt_token",
          "fv",
          "createdAt",
          "updatedAt",
          "Organization_Device_Groups_Items",
        ];
        const response = await helper.post_request_with_authorization(data);
        expect(Object.keys(response.body.data)).toStrictEqual(
          expectedResponseKeys,
        );
        expect(response.body.data.orgId).toBe(testOrganizationId);
        expect(
          response.body.data.Organization_Device_Groups_Items.length,
        ).toBeGreaterThanOrEqual(2);
        expect(response.status).toBe(200);
      });
    });
    describe("Fail", () => {
      it("Should throw an error if name field not passed", async () => {
        const data = {
          token: tokens.testCustomer,
          endpoint: "group/create",
          params: {},
        };
        const expectedResponse = {
          success: false,
          data: { errors: { name: ["The name field is required."] } },
        };
        const response = await helper.post_request_with_authorization(data);
        expect(response.body).toEqual(expectedResponse);
      });
      it("Should throw an error if empty name field is passed", async () => {
        const data = {
          token: tokens.testCustomer,
          endpoint: "group/create",
          params: { name: " " },
        };
        const expectedResponse = {
          success: false,
          data: { errors: { name: ["The name field is required."] } },
        };
        const response = await helper.post_request_with_authorization(data);
        expect(response.body).toEqual(expectedResponse);
      });

      it("Should throw an error if admin not pass organization id", async () => {
        const data = {
          token: tokens.superadmin,
          endpoint: "group/create",
          params: { name: "Test Group" },
        };
        const expectedResponse = {
          success: false,
          data: "Organization id is required",
        };
        const response = await helper.post_request_with_authorization(data);
        expect(response.body).toEqual(expectedResponse);
      });

      it("Should not attach device in organization group items pass wrong device Id", async () => {
        const data = {
          token: tokens.testCustomer,
          endpoint: "group/create",
          params: { name: "New Group", device_ids: "03548750234" },
        };
        const expectedResponseOrganizationDeviceGroupItems = [];
        const response = await helper.post_request_with_authorization(data);
        expect(response.body.data.Organization_Device_Groups_Items).toEqual(
          expectedResponseOrganizationDeviceGroupItems,
        );
      });

      it("Should not create new group if organization id is incorrect when login with superAdmin", async () => {
        const wrongOrganizationId = -1;
        const data = {
          token: tokens.superadmin,
          endpoint: "group/create",
          params: {
            name: "New test group",
            orgId: wrongOrganizationId,
          },
        };
        const expectedResponse = {
          success: false,
          data: "Organization not found",
        };
        const response = await helper.post_request_with_authorization(data);

        expect(response.body).toEqual(expectedResponse);
        expect(response.status).toBe(404);
      });

      it("Should throw 500 if connection with MQTT broker is down", async () => {
        global.mqtt_connection_ok = false;
        const data = {
          token: tokens.testCustomer,
          endpoint: "group/create",
          params: { name: "New Group", device_ids: "03548750234" },
        };
        const expectedResponse = {
          success: false,
          data: "Connection with broker is down",
        };
        const response = await helper.post_request_with_authorization(data);
        expect(response.body).toEqual(expectedResponse);
        global.mqtt_connection_ok = true;
      });

      it("Should throw 500 if connection with MQTT broker is down", async () => {
        const data = {
          token: tokens.zongCustomer,
          endpoint: "group/create",
          params: { name: "New Group", orgId: testOrganizationId },
        };
        const expectedResponseKeys = [
          "id",
          "schedule_id",
          "orgId",
          "name",
          "status",
          "mqtt_token",
          "fv",
          "createdAt",
          "updatedAt",
          "Organization_Device_Groups_Items",
        ];
        const response = await helper.post_request_with_authorization(data);
        expect(Object.keys(response.body.data)).toStrictEqual(
          expectedResponseKeys,
        );
        expect(response.body.data.orgId).toBe(zongOrganizationId);
      });
    });
  });

  describe("Get /group/get/{id}", () => {
    let testOrganizationGroup;
    let testCustomerGroup;

    beforeAll(async () => {
      testOrganizationGroup = await createNewGroup(
        tokens.superadmin,
        testOrganizationId,
      );
      testCustomerGroup = await createNewGroup(tokens.testCustomer);
    });
    describe("Success", () => {
      it("Should get group detail if group If is correct", async () => {
        const data = {
          token: tokens.superadmin,
          endpoint: `group/get/${testOrganizationGroup.id}`,
        };

        const response = await helper.get_request_with_authorization(data);
        expect(response.body.data).toEqual(testOrganizationGroup);
      });

      it("Organization user should able to get own organization group", async () => {
        const data = {
          token: tokens.testCustomer,
          endpoint: `group/get/${testCustomerGroup.id}`,
        };

        const response = await helper.get_request_with_authorization(data);
        expect(response.body.data).toEqual(testCustomerGroup);
      });
    });
    describe("Fail", () => {
      it("Should fail to get other organization group", async () => {
        const data = {
          token: tokens.zongCustomer,
          endpoint: `group/get/${testOrganizationGroup.id}`,
        };

        const response = await helper.get_request_with_authorization(data);
        expect(response.body.data).toEqual(null);
      });

      it("Should throw exception if group is not found", async () => {
        const randomId = -1;
        const data = {
          token: tokens.testCustomer,
          endpoint: `group/get/${randomId}`,
        };

        const response = await helper.get_request_with_authorization(data);
        expect(response.body.data).toEqual(null);
      });
    });
  });

  describe("Get /group/ungrouped-user-devices", () => {
    let testOrganizationDevices = [];
    let zongCustomerDevices = [];

    beforeAll(async () => {
      Device.destroy({
        where: {},
        truncate: true,
      });
      Organization_Device_Groups_Items.destroy({
        where: {},
        truncate: true,
      });

      testOrganizationDevices[0] = await createNewDevices(tokens.superadmin);
      testOrganizationDevices[1] = await createNewDevices(tokens.superadmin);
      zongCustomerDevices[0] = await createNewDevices(tokens.zongCustomer);
      zongCustomerDevices[1] = await createNewDevices(tokens.zongCustomer);
    });
    describe("Success", () => {
      it("superadmin should able to get all devices", async () => {
        const data = {
          token: tokens.superadmin,
          endpoint: `group/ungrouped-user-devices`,
        };

        const expectedResponseLength =
          testOrganizationDevices.length + zongCustomerDevices.length;
        const response = await helper.get_request_with_authorization(data);
        expect(response.body.data.length).toEqual(expectedResponseLength);
      });

      it("superadmin should able to devices of a organization", async () => {
        const data = {
          token: tokens.superadmin,
          endpoint: `group/ungrouped-user-devices?&orgId=${testOrganizationId}`,
        };

        const expectedResponseLength = testOrganizationDevices.length;
        const response = await helper.get_request_with_authorization(data);
        expect(response.body.data.length).toEqual(expectedResponseLength);
        response.body.data.forEach((device) => {
          expect(device.owner_id).toEqual(testOrganizationId);
        });
      });

      it("organization user should able to get devices of his organization", async () => {
        const data = {
          token: tokens.zongCustomer,
          endpoint: `group/ungrouped-user-devices`,
        };

        const expectedResponseLength = zongCustomerDevices.length;
        const response = await helper.get_request_with_authorization(data);
        expect(response.body.data.length).toEqual(expectedResponseLength);
      });

      it("should contain the expected fields in response", async () => {
        const data = {
          token: tokens.zongCustomer,
          endpoint: `group/ungrouped-user-devices`,
        };

        const expectedResponseKeys = [
          "bill_cleared",
          "device_id",
          "name",
          "owner_id",
          "serial",
        ];
        const response = await helper.get_request_with_authorization(data);
        expect(Object.keys(response.body.data[0])).toEqual(
          expect.arrayContaining(expectedResponseKeys),
        );
      });
    });
    describe("Fail", () => {
      it("should throw exception if superadmin pass wrong organization Id", async () => {
        const wrongOrganizationId = -1;
        const data = {
          token: tokens.superadmin,
          endpoint: `group/ungrouped-user-devices?&orgId=${wrongOrganizationId}`,
        };

        const expectedResponse = {
          success: false,
          data: "Organization not found",
        };
        const response = await helper.get_request_with_authorization(data);
        expect(response.body).toEqual(expectedResponse);
        expect(response.status).toEqual(404);
      });

      it("should not return the other organization devices to organizational devices if orgId is send.", async () => {
        const data = {
          token: tokens.zongCustomer,
          endpoint: `group/ungrouped-user-devices?&orgId=${testOrganizationId}`,
        };

        const expectedResponseLength = zongCustomerDevices.length;
        const response = await helper.get_request_with_authorization(data);
        expect(response.body.data.length).toEqual(expectedResponseLength);
        response.body.data.forEach((device) => {
          expect(device.owner_id).toEqual(zongOrganizationId);
        });
      });
    });
  });

  describe("Post /group/attach-devices", () => {
    let superAdminDevices = [];
    let zongCustomerDevices = [];
    let testOrgDevices = [];
    let zongCustomerGroup;
    let testCustomerGroup;

    beforeAll(async () => {
      Device.destroy({
        where: {},
        truncate: true,
      });
      Organization_Device_Groups_Items.destroy({
        where: {},
        truncate: true,
      });

      superAdminDevices[0] = await createNewDevices(tokens.superadmin);
      superAdminDevices[1] = await createNewDevices(tokens.superadmin);

      testOrgDevices[0] = await createNewDevices(tokens.testCustomer);
      testCustomerGroup = await createNewGroup(tokens.testCustomer);

      zongCustomerDevices[0] = await createNewDevices(tokens.zongCustomer);
      zongCustomerDevices[1] = await createNewDevices(tokens.zongCustomer);
      zongCustomerDevices[2] = await createNewDevices(tokens.zongCustomer);
      zongCustomerGroup = await createNewGroup(tokens.zongCustomer);
    });
    describe("Success", () => {
      it("superadmin should able to add devices into a organization group", async () => {
        const data = {
          token: tokens.superadmin,
          endpoint: `group/attach-devices`,
          params: {
            group_id: zongCustomerGroup.id,
            device_ids: `${zongCustomerDevices[0].id}`,
          },
        };

        const expectedResponse = {
          success: true,
          data: [`${zongCustomerDevices[0].id}`],
        };
        const response = await helper.post_request_with_authorization(data);
        expect(response.body).toEqual(expectedResponse);
      });

      it("organization user should able to add devices into own organization group", async () => {
        const data = {
          token: tokens.zongCustomer,
          endpoint: `group/attach-devices`,
          params: {
            group_id: zongCustomerGroup.id,
            device_ids: `${zongCustomerDevices[1].id}`,
          },
        };

        const expectedResponse = {
          success: true,
          data: [`${zongCustomerDevices[1].id}`],
        };
        const response = await helper.post_request_with_authorization(data);
        expect(response.body).toEqual(expectedResponse);
      });

      it.only("should send the previous state to the group channel", async () => {
        const data = {
          token: tokens.zongCustomer,
          endpoint: `group/attach-devices`,
          params: {
            group_id: zongCustomerGroup.id,
            device_ids: `${zongCustomerDevices[2].id}`,
          },
        };

        const previousGroupHistory = {
          group_id: zongCustomerGroup.id,
          action: {
            deviceIds: "",
          },
        };
        await GroupHistoryModel.save_history(previousGroupHistory);

        await helper.post_request_with_authorization(data);
      });
    });

    describe("Fail", () => {
      it("Super admin Should not add the device of one organization to another organization group", async () => {
        const data = {
          token: tokens.superadmin,
          endpoint: `group/attach-devices`,
          params: {
            group_id: zongCustomerGroup.id,
            device_ids: `${superAdminDevices[0].id}`,
          },
        };

        const expectedResponse = { success: true, data: [] };
        const response = await helper.post_request_with_authorization(data);
        expect(response.body).toEqual(expectedResponse);
      });

      it("organization user should not be able to add devices into other organization group", async () => {
        const data = {
          token: tokens.zongCustomer,
          endpoint: `group/attach-devices`,
          params: {
            group_id: testCustomerGroup.id,
            device_ids: `${zongCustomerDevices[1].id}`,
          },
        };

        const expectedResponse = { success: false, data: "group not found" };
        const response = await helper.post_request_with_authorization(data);
        expect(response.body).toEqual(expectedResponse);
      });

      it("organization user should not be able to add other organization devices into own organization group", async () => {
        const data = {
          token: tokens.zongCustomer,
          endpoint: `group/attach-devices`,
          params: {
            group_id: zongCustomerGroup.id,
            device_ids: `${testOrgDevices[0].id}`,
          },
        };

        const expectedResponse = { success: true, data: [] };
        const response = await helper.post_request_with_authorization(data);
        expect(response.body).toEqual(expectedResponse);
      });

      it("Should throw 500 if connection with MQTT broker is down", async () => {
        global.mqtt_connection_ok = false;
        const data = {
          token: tokens.zongCustomer,
          endpoint: `group/attach-devices`,
          params: {
            group_id: zongCustomerGroup.id,
            device_ids: `${testOrgDevices[0].id}`,
          },
        };
        const expectedResponse = {
          success: false,
          data: "Connection with broker is down",
        };
        const response = await helper.post_request_with_authorization(data);
        expect(response.body).toEqual(expectedResponse);
        global.mqtt_connection_ok = true;
      });
    });
  });

  describe("Put /group/unlink-device", () => {
    let superAdminDevices = [];
    let zongCustomerDevices = [];
    let testOrgDevices = [];
    let testOrgGroup;
    let zongCustomerGroup;
    let testCustomerGroup;

    beforeAll(async () => {
      Device.destroy({
        where: {},
        truncate: true,
      });
      Organization_Device_Groups_Items.destroy({
        where: {},
        truncate: true,
      });

      zongCustomerDevices[0] = await createNewDevices(tokens.zongCustomer);
      zongCustomerDevices[1] = await createNewDevices(tokens.zongCustomer);
      zongCustomerDevices[2] = await createNewDevices(tokens.zongCustomer);
      zongCustomerGroup = await createNewGroup(tokens.zongCustomer);
      await attachDeviceToGroup(
        tokens.zongCustomer,
        zongCustomerGroup.id,
        `${zongCustomerDevices[0].id}`,
      );
      await attachDeviceToGroup(
        tokens.zongCustomer,
        zongCustomerGroup.id,
        `${zongCustomerDevices[2].id}`,
      );

      testOrgDevices[0] = await createNewDevices(tokens.testCustomer);
      testOrgGroup = await createNewGroup(tokens.testCustomer);
      await attachDeviceToGroup(
        tokens.testCustomer,
        testOrgGroup.id,
        testOrgDevices[0].id,
      );
    });
    describe("Success", () => {
      it("superadmin should able to unlink a device from a organization group", async () => {
        const data = {
          token: tokens.superadmin,
          endpoint: `group/unlink-device`,
          params: {
            group_id: zongCustomerGroup.id,
            device_id: `${zongCustomerDevices[0].id}`,
          },
        };

        const expectedResponse = {
          success: true,
          data: "deleted",
        };
        const response = await helper.put_request_with_authorization(data);
        expect(response.body).toEqual(expectedResponse);
      });

      it("Customer should able to unlink a device from own organization group", async () => {
        await attachDeviceToGroup(
          tokens.zongCustomer,
          zongCustomerGroup.id,
          `${zongCustomerDevices[0].id}`,
        );

        const data = {
          token: tokens.zongCustomer,
          endpoint: `group/unlink-device`,
          params: {
            group_id: zongCustomerGroup.id,
            device_id: `${zongCustomerDevices[0].id}`,
          },
        };

        const expectedResponse = {
          success: true,
          data: "deleted",
        };
        const response = await helper.put_request_with_authorization(data);
        expect(response.body).toEqual(expectedResponse);
      });
      it.only("should send the previous state to the group channel", async () => {
        const data = {
          token: tokens.zongCustomer,
          endpoint: `group/unlink-device`,
          params: {
            group_id: zongCustomerGroup.id,
            device_id: `${zongCustomerDevices[2].id}`,
          },
        };

        const previousGroupHistory = {
          group_id: zongCustomerGroup.id,
          action: {
            deviceIds: "",
          },
        };
        await GroupHistoryModel.save_history(previousGroupHistory);

        await helper.put_request_with_authorization(data);
      });
    });

    describe("Fail", () => {
      it("Customer should not able to unlink a device from other organization group", async () => {
        const data = {
          token: tokens.zongCustomer,
          endpoint: `group/unlink-device`,
          params: {
            group_id: zongCustomerGroup.id,
            device_id: `${zongCustomerDevices[1].id}`,
          },
        };

        const expectedResponse = {
          success: false,
          data: "Device does not belong to the group",
        };
        const response = await helper.put_request_with_authorization(data);
        expect(response.body).toEqual(expectedResponse);
      });

      it("Admin should not able to unlink a device from other organization group", async () => {
        const data = {
          token: tokens.superadmin,
          endpoint: `group/unlink-device`,
          params: {
            group_id: zongCustomerGroup.id,
            device_id: `${zongCustomerDevices[1].id}`,
          },
        };

        const expectedResponse = {
          success: false,
          data: "Device does not belong to the group",
        };
        const response = await helper.put_request_with_authorization(data);
        expect(response.body).toEqual(expectedResponse);
      });

      it("Should throw exception if device belong to other organization", async () => {
        const data = {
          token: tokens.zongCustomer,
          endpoint: `group/unlink-device`,
          params: {
            group_id: testOrgGroup.id,
            device_id: `${testOrgDevices[0].id}`,
          },
        };

        const expectedResponse = {
          success: false,
          data: "Device not found",
        };
        const response = await helper.put_request_with_authorization(data);
        expect(response.body).toEqual(expectedResponse);
      });

      it("Should throw exception if group belong to other organization", async () => {
        const data = {
          token: tokens.zongCustomer,
          endpoint: `group/unlink-device`,
          params: {
            group_id: testOrgGroup.id,
            device_id: `${zongCustomerDevices[0].id}`,
          },
        };

        const expectedResponse = {
          success: false,
          data: "Group not found",
        };
        const response = await helper.put_request_with_authorization(data);
        expect(response.body).toEqual(expectedResponse);
      });

      it("Should throw 500 if connection with MQTT broker is down", async () => {
        global.mqtt_connection_ok = false;
        const data = {
          token: tokens.zongCustomer,
          endpoint: `group/unlink-device`,
          params: {
            group_id: testOrgGroup.id,
            device_id: `${zongCustomerDevices[0].id}`,
          },
        };

        const expectedResponse = {
          success: false,
          data: "Connection with broker is down",
        };
        const response = await helper.put_request_with_authorization(data);
        expect(response.body).toEqual(expectedResponse);
        global.mqtt_connection_ok = true;
      });
    });
  });
});
