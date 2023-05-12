const { organizationsInApplication } = require("../../../../../common/organizations.data");
const helper = require("../../../../helper");
const moment = require("moment");

let testCustomerToken, superAdminToken, testOrganizatonId = organizationsInApplication.test.id, zongOrganizationId = organizationsInApplication.zong.id


beforeAll(async () => {
    testCustomerToken = await helper.get_token_for("testCustomer")
    superAdminToken = await helper.get_token_for("superadmin")
})
const requestBody = {
    title: "Example",
    description: "Test Coupon",
    expiry: moment().format("YYYY-MM-DDTHH:mm:ssZ"),
    code: "XYZa123",
    discountType: "fixed",
    discount: 50,
    maxUseLimit: 100
}
console.log({requestBody});
describe("POST /kiosk-content/coupons", () => {

    const makeApiRequest = async (params, token = superAdminToken) => {
        return helper.post_request_with_authorization({
            endpoint: "kiosk-content/coupons",
            token: token,
            params: params,
        });
    };

    it("should return 400 and validation errors for the corresponding required fields", async () => {

        const expectedResponse = {
            success: false,
            data: {
                errors: {
                    code: [ "The code field is required." ],
                    discount:  [ "The discount field is required." ],
                    discountType: ["The discountType field is required."],
                    expiry: ["The expiry field is required."],
                    maxUseLimit: [ "The maxUseLimit field is required." ],
                    title: [ "The title field is required." ]
                }
            }
        }

        const response = await makeApiRequest({})
        
        expect(response.body).toStrictEqual(expectedResponse)
        expect(response.statusCode).toBe(400)

    })

    it("should return error if super admin does not send orgId nor gcId in the body", async () => {

        // It is compulsory for super admin to send either gcId or orgId.
        
        const expectedResponse = {
            success: false,
            data: "Parent resource id is required"
        }

        const response = await makeApiRequest(requestBody)
        
        expect(response.body).toStrictEqual(expectedResponse)
        expect(response.statusCode).toBe(400)

    })

    it("should return error if super admin does not send orgId nor gcId in the body", async () => {

        // It is compulsory for super admin to send either gcId or orgId.
        
        const expectedResponse = {
            success: false,
            data: "Parent resource id is required"
        }

        const response = await makeApiRequest(requestBody)
        
        expect(response.body).toStrictEqual(expectedResponse)
        expect(response.statusCode).toBe(400)

    })

    it("should return error if customer tries to create coupons in the organization he/she does not belong to", async () => {

        // It is compulsory for super admin to send either gcId or orgId.
        
        const expectedResponse = {
            success: false,
            data: "You are not allowed"
        }
        const requestBodyClone = {...requestBody, orgId: zongOrganizationId}
        const response = await makeApiRequest(requestBodyClone, testCustomerToken)
        
        expect(response.body).toStrictEqual(expectedResponse)
        expect(response.statusCode).toBe(403)

    })

    it("should return error if the specified parent (organization or golf course) does not exist", async () => {

        // It is compulsory for super admin to send either gcId or orgId.
        
        const expectedResponse = {
            success: false,
            data: "You are not allowed"
        }
        const requestBodyClone = {...requestBody, orgId: zongOrganizationId}
        const response = await makeApiRequest(requestBodyClone, testCustomerToken)
        
        expect(response.body).toStrictEqual(expectedResponse)
        expect(response.statusCode).toBe(403)

    })

    it("should return error if both gcId and orgId are sent - Coupon can have only one parent", async () => {

        const expectedResponse = {
            success: false,
            data: "Coupon can have only one parent"
        }
        const requestBodyClone = {...requestBody, orgId: testOrganizatonId, gcId: 1000}
        const response = await makeApiRequest(requestBodyClone, testCustomerToken)
        
        expect(response.body).toStrictEqual(expectedResponse)
        expect(response.statusCode).toBe(400)

    })

    it("should return error if both gcId and orgId are sent - Coupon can have only one parent", async () => {

        const expectedResponse = {
            success: false,
            data: "Coupon can have only one parent"
        }
        const requestBodyClone = {...requestBody, orgId: testOrganizatonId, gcId: 1000}
        const response = await makeApiRequest(requestBodyClone, testCustomerToken)
        
        expect(response.body).toStrictEqual(expectedResponse)
        expect(response.statusCode).toBe(400)

    })

    it("should return error if organization does not exist in case of super admin", async () => {

        const expectedResponse = {
            success: false,
            data: "Parent does not exist"
        }
        const requestBodyClone = {...requestBody, orgId: -1}
        const response = await makeApiRequest(requestBodyClone, superAdminToken)
        
        expect(response.body).toStrictEqual(expectedResponse)
        expect(response.statusCode).toBe(404)

    })

    it("should create the coupon under the customer's organization successfully", async () => {

        const requestBodyClone = {...requestBody}
        const response = await makeApiRequest(requestBodyClone, testCustomerToken)
        
        const expectedResponse = {
            ...requestBodyClone,
            orgId: testOrganizatonId,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            id: expect.any(Number)
        }
        expect(response.body.data).toEqual(expectedResponse)
        expect(response.body.success).toBe(true)
        expect(response.statusCode).toBe(200)

    })
    
        
})  