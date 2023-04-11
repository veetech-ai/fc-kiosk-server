const helper = require("../../helper");

describe("Order", () => {
  let tokens;
  let orderId;

  beforeAll(async () => {
    tokens = await helper.get_all_roles_tokens();
    // creating order
    const data = {
      params: {
        ip_address: "192.XXX.X.X",
        payment_info: JSON.stringify({ cash: "dollar" }),
        items: JSON.stringify([{ project: "testing" }]),
      },
      token: tokens.superadmin,
      endpoint: "order/new",
    };
    const response = await helper.post_request_with_authorization(data);
    orderId = response.body.data.id;
  });

  describe("GET: /order/all", () => {
    describe("Success", () => {
      it("Should get order", async () => {
        const data = {
          token: tokens.superadmin,
          endpoint: "order/all",
        };
        const response = await helper.get_request_with_authorization(data);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBeGreaterThanOrEqual(0);
      });
    });
  });
  describe("GET: order/my", () => {
    describe("Success", () => {
      it("Should get my order", async () => {
        const data = {
          token: tokens.superadmin,
          endpoint: "order/my",
        };
        const response = await helper.get_request_with_authorization(data);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBeGreaterThanOrEqual(0);
      });
    });
  });
  describe("GET: order/get/{id}", () => {
    describe("Success", () => {
      it("Should get Order with ID", async () => {
        const data = {
          token: tokens.superadmin,
          endpoint: `order/get/${orderId}`,
        };
        const response = await helper.get_request_with_authorization(data);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty("id", orderId);
      });
    });
    describe("Failure", () => {
      it("Should not get Order with wrong ID", async () => {
        const data = {
          token: tokens.superadmin,
          endpoint: "order/get/null",
        };
        const response = await helper.get_request_with_authorization(data);

        expect(response.status).toBe(400);
        expect(response.body.data).toBe("Order not found");
      });
    });
  });
  describe("GET: order/get-last-pending", () => {
    describe.skip("Success", () => {
      it("Should get last pending order of user", async () => {
        const data = {
          token: tokens.superadmin,
          endpoint: "order/get-last-pending",
        };
        const response = await helper.get_request_with_authorization(data);

        expect(response.status).toBe(200);
      });
    });
    describe("Failure", () => {
      it("Should not get last pending order of user", async () => {
        const data = {
          token: tokens.superadmin,
          endpoint: "order/get-last-pending",
        };
        const response = await helper.get_request_with_authorization(data);

        expect(response.status).toBe(400);
        expect(response.body.data).toBe("Order not found");
      });
    });
  });
  describe("POST: order/new", () => {
    describe("Success", () => {
      it("Should create new order", async () => {
        const data = {
          params: {
            ip_address: "192.XXX.X.X",
            payment_info: JSON.stringify({ cash: "rupess" }),
            items: JSON.stringify([{ project: "iotcore" }]),
          },
          token: tokens.superadmin,
          endpoint: "order/new",
        };
        const response = await helper.post_request_with_authorization(data);
        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty(
          "payment_info",
          JSON.parse(data.params.payment_info),
        );
      });
    });
    describe("Failure", () => {
      it("Should not create new order", async () => {
        const data = {
          params: {
            ip_address: "192.XXX.X.X",
            params: {
              payment_info: { cash: "rupess" },
              items: JSON.stringify({ project: "iotcore" }),
            },
          },
          token: tokens.superadmin,
          endpoint: "order/new",
        };
        const response = await helper.post_request_with_authorization(data);
        expect(response.status).toBe(500);
      });
    });
    describe("Failure", () => {
      it("Should not create new order", async () => {
        const data = {
          params: {
            //   ip_address: "192.XXX.X.X",
            params: {
              payment_info: JSON.stringify({ info: "testing" }),
              items: JSON.stringify({ project: "iotcore" }),
            },
          },
          token: tokens.superadmin,
          endpoint: "order/new",
        };
        const response = await helper.post_request_with_authorization(data);
        expect(response.status).toBe(400);
      });
    });
  });
  describe("POST: order/status/{id}", () => {
    //need to write success test cases as for now endpoint have issue
    describe("Success", () => {
      it("Should Change order status", async () => {
        const data = {
          params: {
            status: 1,
          },
          token: tokens.superadmin,
          endpoint: `order/status/${orderId}`,
        };
        const response = await helper.put_request_with_authorization(data);
        expect(response.status).toBe(200);
        console.log(response.body.data);
        expect(response.body.data.length).toBeGreaterThanOrEqual(0);
      });
    });
    describe("Failure", () => {
      it("Should not change order status when order id id wrong", async () => {
        const data = {
          params: {
            status: 1,
          },
          token: tokens.superadmin,
          endpoint: `order/status/0`,
        };
        const response = await helper.put_request_with_authorization(data);
        expect(response.status).toBe(404);
        expect(response.body.data).toBe("Order not found");
      });
    });
  });
  describe("PUT: order/update/{orderId}", () => {
    describe("Success", () => {
      it("Should update order", async () => {
        const data = {
          params: {
            order_id: orderId,
            voucher: JSON.stringify({ testing: "testingVoucher" }),
            payment_info: JSON.stringify({ cash: "rupess" }),
            items: JSON.stringify({ project: "iotcore" }),
          },
          token: tokens.superadmin,
          endpoint: "order/update/{orderId}",
        };
        const response = await helper.put_request_with_authorization(data);
        expect(response.status).toBe(200);
      });
    });

    describe("Failure", () => {
      it("Should not update order", async () => {
        const data = {
          params: {
            payment_info: { cash: "rupess" },
            items: JSON.stringify({ project: "iotcore" }),
          },
          token: tokens.superadmin,
          endpoint: "order/update/{orderId}",
        };
        const response = await helper.put_request_with_authorization(data);
        expect(response.status).toBe(400);
      });
    });
  });
});
