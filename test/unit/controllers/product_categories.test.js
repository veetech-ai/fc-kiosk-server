const helper = require("../../helper");

describe("Product Categories", () => {
  let tokens;
  let firstproductCategoriesId;
  let secondproductCategoriesId;

  beforeAll(async () => {
    tokens = await helper.get_all_roles_tokens();
    const data = {
      params: {
        title: "pod4",
      },
      token: tokens.superadmin,
      endpoint: "product-category/create",
    };
    const response = await helper.post_request_with_authorization(data);
    firstproductCategoriesId = response.body.data.id;
  });

  //getting all active product categories
  it("get all active product categories", async () => {
    const data = {
      token: tokens.superadmin,
      endpoint: "product-category/all/active",
    };
    const response = await helper.get_request_with_authorization(data);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(0);
  });

  //getting all product categories
  it("getting all product categories", async () => {
    const data = {
      token: tokens.superadmin,
      endpoint: "product-category/all",
    };
    const response = await helper.get_request_with_authorization(data);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(0);
  });

  // getting product categories by id
  it("getting  product categories by id", async () => {
    const data = {
      token: tokens.superadmin,
      endpoint: `product-category/get/${firstproductCategoriesId}`,
    };
    const response = await helper.get_request_with_authorization(data);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(parseInt(`${firstproductCategoriesId}`));
  });

  // creating product categories
  it("success: creating product categories", async () => {
    const data = {
      params: {
        title: "unittesting",
      },
      token: tokens.superadmin,
      endpoint: "product-category/create",
    };
    const response = await helper.post_request_with_authorization(data);

    secondproductCategoriesId = response.body.data.id;
    expect(response.status).toBe(200);
    expect(typeof response.body.data === "object").toBe(true);
    expect(response.body.data.id).toBeTruthy();
  });

  it("failure: duplicate product categories not allowed", async () => {
    const data = {
      params: {
        title: "unittesting",
      },
      token: tokens.superadmin,
      endpoint: "product-category/create",
    };
    const response = await helper.post_request_with_authorization(data);

    expect(response.status).toBe(400);
    expect(response.body.data).toBe(`Category already exists`);
  });

  it("unauthorized: only admin can create", async () => {
    const data = {
      params: {
        title: "iotcore",
      },
      token: tokens.testCustomer,
      endpoint: `product-category/create`,
    };

    const response = await helper.post_request_with_authorization(data);

    expect(response.status).toBe(403);
    expect(response.body.data).toBe(`You are not allowed`);
  });

  // updating product-categories
  it("success: updating product categories successfully with super admin account", async () => {
    const data = {
      params: {
        categoryId: firstproductCategoriesId,

        title: "cowlar",
      },
      token: tokens.superadmin,
      endpoint: `product-category/update/${firstproductCategoriesId}`,
    };

    const response = await helper.put_request_with_authorization(data);

    expect(response.status).toBe(200);
    expect(response.body.data).toBe(`updated`);
  });

  it("failure: can not update as it already exist", async () => {
    const data = {
      params: {
        categoryId: secondproductCategoriesId,
        title: "cowlar",
      },
      token: tokens.superadmin,
      endpoint: `product-category/update/${secondproductCategoriesId}`,
    };

    const response = await helper.put_request_with_authorization(data);

    expect(response.status).toBe(400);
    expect(response.body.data).toBe(`Category already exists`);
  });

  it("notfound: category not exist", async () => {
    const data = {
      params: {
        title: "wrongid",
      },
      token: tokens.superadmin,
      endpoint: `product-category/update/null`,
    };

    const response = await helper.put_request_with_authorization(data);

    expect(response.status).toBe(404);
    expect(response.body.data).toBe(`Category not found`);
  });

  it("unauthorized: only admin can update", async () => {
    const data = {
      params: {
        categoryId: secondproductCategoriesId,
        title: "cowlar",
      },
      token: tokens.testCustomer,
      endpoint: `product-category/update/${secondproductCategoriesId}`,
    };

    const response = await helper.put_request_with_authorization(data);

    expect(response.status).toBe(403);
    expect(response.body.data).toBe(`You are not allowed`);
  });
});
