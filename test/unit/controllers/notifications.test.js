const helper = require("../../helper");

describe("Product Tracker", () => {
  let tokens;
  let userId;

  beforeAll(async () => {
    tokens = await helper.get_all_roles_tokens();
    console.log(
      "🔥🧯🚒👨‍🚒 👉 file: notifications.test.js:9 👉 beforeAll 👉 tokens",
      tokens,
    );
    const data = {
      params: {
        subscription: JSON.stringify({ name: "unittest" }),
      },
      token: tokens.superadmin,
      endpoint: "notification/push-notification",
    };

    const response = await helper.post_request_with_authorization(data);
    userId = response.body.data.user_id;
  });

  describe("GET: /notification/unread", () => {
    describe("Success", () => {
      it("Should Get unread Notifications", async () => {
        const data = {
          token: tokens.superadmin,
          endpoint: "notification/unread",
        };

        const response = await helper.get_request_with_authorization(data);
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBeGreaterThanOrEqual(0);
      });
    });
  });
  describe("GET: notification/all", () => {
    describe("Success", () => {
      it("Should Get Get Notifications", async () => {
        const data = {
          token: tokens.superadmin,
          endpoint: "notification/all",
        };

        const response = await helper.get_request_with_authorization(data);
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("POST: /notification/push-notification", () => {
    describe("Success", () => {
      it("Should set user web push notification", async () => {
        // prettier-ignore
        const data = {
          params: {
            subscription: JSON.stringify({ "name": "testinbg" }),
          },
          token: tokens.superadmin,
          endpoint: "notification/push-notification",
        };

        const response = await helper.post_request_with_authorization(data);
        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty("id");
        expect(response.body.data).toHaveProperty(
          "subscription",
          JSON.parse(`${data.params.subscription}`),
        );
      });
    });
    describe("Failure", () => {
      it("Should not set user web push notification when format is wrong ", async () => {
        // prettier-ignore
        const data = {
          params: {
            subscription: ({ "name": "testinbg" }),
          },
          token: tokens.superadmin,
          endpoint: "notification/push-notification",
        };
        const response = await helper.post_request_with_authorization(data);
        expect(response.status).toBe(400);
        expect(response.body.data.errors.subscription[0]).toBe(
          "The subscription must be a JSON string.",
        );
      });
    });
  });
  describe("POST: notification/send-push-notification-to-all", () => {
    describe("Success", () => {
      it("Should Send test notification to all", async () => {
        const data = {
          params: {
            title: "testing",
            description: "for testing purpose",
          },
          token: tokens.superadmin,
          endpoint: "notification/send-push-notification-to-all",
        };

        const response = await helper.post_request_with_authorization(data);
        userId = response.body.data.user_id;
        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty("total_subscriptions");
        expect(response.body.data).toHaveProperty("notifications");
      });
    });
    describe("unathorized", () => {
      it("Should not authorize to Send test notification to all", async () => {
        const data = {
          params: {
            title: "testing",
            description: "for testing purpose",
          },
          token: tokens.testCustomer,
          endpoint: "notification/send-push-notification-to-all",
        };

        const response = await helper.post_request_with_authorization(data);
        userId = response.body.data.user_id;
        expect(response.status).toBe(403);
        expect(response.body.data).toBe("You are not allowed");
      });
    });
    describe("without token", () => {
      it("Should not access if token is not provided", async () => {
        const data = {
          params: {
            title: "testing",
            description: "for testing purpose",
          },
          token: "",
          endpoint: "notification/send-push-notification-to-all",
        };

        const response = await helper.post_request_with_authorization(data);
        userId = response.body.data.user_id;
        expect(response.status).toBe(401);
        expect(response.body.data).toBe("Token not provided");
      });
    });
    describe.skip("Failure", () => {
      it("Should not Send test notification to all ", async () => {
        // prettier-ignore
        const data = {
          params: {
            title: "testing",
            description: 454,
          },
          token: tokens.superadmin,
          endpoint: "notification/send-push-notification-to-all",
        };
        const response = await helper.post_request_with_authorization(data);
        expect(response.status).toBe(400);
      });
    });
  });
});
