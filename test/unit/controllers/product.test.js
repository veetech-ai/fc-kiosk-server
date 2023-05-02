const helper = require("../../helper");

describe("product", () => {
  let tokens;
  let firstProduct;
  let secondProduct;
  const createProduct = async (productTitle) => {
    let data = {
      params: {
        title: productTitle,
        price: 20,
        file_key: "image",
        file_path: "check.png",
      },
      fileupload: true,
      token: tokens.superadmin,
      endpoint: "product/create",
    };
    const response = await helper.post_request_with_authorization(data);
    return response.body.data.id;
  };

  beforeAll(async () => {
    tokens = await helper.get_all_roles_tokens();
    firstProduct = await createProduct("title1");
    secondProduct = await createProduct("title2");
  });
  // getting all product list
  it("success: getting all product", async () => {
    const data = {
      token: tokens.superadmin,
      endpoint: "product/all",
    };
    const response = await helper.get_request_with_authorization(data);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(0);
  });

  // getting all product that are active
  it("success: getting all product that are active", async () => {
    const data = {
      token: tokens.superadmin,
      endpoint: "product/all/active",
    };
    const response = await helper.get_request_with_authorization(data);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(0);
  });

  // getting single product
  it("success: getting single product", async () => {
    const data = {
      token: tokens.superadmin,
      endpoint: "product/get-single",
    };
    const response = await helper.get_request_with_authorization(data);

    expect(response.status).toBe(200);
    expect(typeof response.body.data === "object").toBe(true);
  });

  // creating product
  it("success: creating product successfully with super admin account", async () => {
    const data = {
      params: {
        title: "unittesting",
        price: 10,
        file_key: "image",
        file_path: "check.png",
      },
      fileupload: true,
      token: tokens.superadmin,
      endpoint: "product/create",
    };
    const response = await helper.post_request_with_authorization(data);
    console.log("product response", response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe(`${data.params.title}`);
    expect(response.body.data.price).toBe(`${data.params.price}`);
  });

  it("failure: duplicate product can't be created", async () => {
    const data = {
      params: {
        title: "unittesting",
        price: 10,
        file_key: "image",
        file_path: "check.png",
      },
      fileupload: true,
      token: tokens.superadmin,
      endpoint: "product/create",
    };
    const response = await helper.post_request_with_authorization(data);

    expect(response.status).toBe(400);
    expect(response.body.data).toBe("Product already exists");
  });

  // getting product by id
  it("success: getting product by id", async () => {
    const data = {
      token: tokens.superadmin,
      endpoint: `product/get/${firstProduct}`,
    };
    const response = await helper.get_request_with_authorization(data);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(parseInt(`${firstProduct}`));
  });

  it("failure: there should be no product with this id", async () => {
    const data = {
      token: tokens.superadmin,
      endpoint: `product/get/null`,
    };
    const response = await helper.get_request_with_authorization(data);

    expect(response.status).toBe(200);
    expect(response.body.data).toBe(null);
  });

  // get product by selective ids
  it("success: getting product by multiple ids", async () => {
    const data = {
      token: tokens.superadmin,
      endpoint: `product/selective/${firstProduct},${secondProduct}`,
    };

    const response = await helper.get_request_with_authorization(data);

    expect(response.status).toBe(200);
    expect(response.body.data[0].id).toBe(parseInt(`${firstProduct}`));
    expect(response.body.data[1].id).toBe(parseInt(`${secondProduct}`));
  });

  it("failure: there should be no product with all these ids", async () => {
    const data = {
      token: tokens.superadmin,
      endpoint: `product/selective/null,null`,
    };

    const response = await helper.get_request_with_authorization(data);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  // updating product
  it("success: updating product successfully with super admin account", async () => {
    const data = {
      params: {
        productId: firstProduct,
        title: "bilal",
        price: 2000,
      },
      fileupload: true,
      token: tokens.superadmin,
      endpoint: `product/update/${firstProduct}`,
    };
    const response = await helper.put_request_with_authorization(data);

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe(`${data.params.title}`);
    expect(response.body.data.price).toBe(parseInt(`${data.params.price}`));
  });

  it("failure: can't update product successfully with same title", async () => {
    const data = {
      params: {
        productId: secondProduct,
        title: "bilal",
        price: 20,
      },
      fileupload: true,
      token: tokens.superadmin,
      endpoint: `product/update/${secondProduct}`,
    };
    const response = await helper.put_request_with_authorization(data);

    expect(response.status).toBe(400);
    expect(response.body.data).toBe(`product already exists`);
  });

  it("failure: product not found", async () => {
    const data = {
      params: {
        productId: "wrongId",
        title: "bilal",
        price: 20,
      },
      fileupload: true,
      token: tokens.superadmin,
      endpoint: `product/update/wrongId`,
    };
    const response = await helper.put_request_with_authorization(data);

    expect(response.status).toBe(400);
    expect(response.body.data).toBe(`product not found`);
  });

  // attaching addon to product
  // it("attaching addon array successfully with super admin", () => {
  //   const data = {
  //     params: {
  //       productId: secondProduct,
  //     },
  //     token: tokens.superadmin,
  //     endpoint: `product/attach-addons`,
  //   };
  //   helper
  //     .put_request_with_authorization(data)
  //
  //       expect(response.status).toBe(400);
  //
  //     })
  //     .catch((e) => {
  //       console.log(e);
  //     });
  // });

  // deleting product by id
  it("success: deleting product by id", async () => {
    const data = {
      token: tokens.superadmin,
      endpoint: `product/delete/${firstProduct}`,
    };
    const response = await helper.delete_request_with_authorization(data);

    expect(response.status).toBe(200);
    expect(response.body.data).toContain(1);
  });

  it("failure: deleting product by id", async () => {
    const data = {
      token: tokens.superadmin,
      endpoint: `product/delete/null`,
    };
    const response = await helper.delete_request_with_authorization(data);

    expect(response.status).toBe(404);
    expect(response.body.data).toBe(`product not found`);
  });
});
