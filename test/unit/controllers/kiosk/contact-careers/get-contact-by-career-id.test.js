const {
    organizationsInApplication,
} = require("../../../../../common/organizations.data");
const helper = require("../../../../helper");
const product = require("../../../../../common/products");

const CoursesServices = require("../../../../../services/kiosk/course");
const DevicesServices = require("../../../../../services/device");
const { uuid } = require("uuidv4");

let testCustomerToken,
    superAdminToken,
    testOrganizatonId = organizationsInApplication.test.id,
    zongOrganizationId = organizationsInApplication.zong.id,
    deviceTokens = {},
    contactCareers = {};

let courses = {
    test: {
        name: "TEST COURSE",
        orgId: testOrganizatonId,
        state: "Albama",
        city: "Abbeville",
    },
    zong: {
        name: "ZONG COURSE",
        orgId: zongOrganizationId,
        state: "Albama",
        city: "Abbeville",
    },
};
const careers = {
    test: {
        title: "Test Career",
        content: "<h2>Example Content</h2>",
        type: "Full Time",
        link: "https://example.com",
    },
    zong: {
        title: "Career",
        content: "<h2>Example Content</h2>",
        type: "Full Time",
        link: "https://example.com",
    }
};

beforeAll(async () => {
    testCustomerToken = await helper.get_token_for("testCustomer");
    superAdminToken = await helper.get_token_for("superadmin");
});

afterAll(async () => {
    for await (const course of Object.values(courses)) {
        await CoursesServices.deleteWhere({ id: course.id });
    }
});

describe("GET /careers/:careerId", () => {
    const getContactCareerByCareerId = async (careerId, token = superAdminToken) => {
        return helper.get_request_with_authorization({
            endpoint: `careers/${careerId}/contacts/`,
            token,
        });
    };

    const createDevice = async (params, token = superAdminToken) => {
        return helper.post_request_with_authorization({
            endpoint: "device/create",
            token,
            params,
        });
    };

    const createGolfCourses = async (params, token = superAdminToken) => {
        return helper.post_request_with_authorization({
            endpoint: "kiosk-courses",
            token,
            params,
        });
    };
    const createCareer = async (params, token = superAdminToken) => {
        return helper.post_request_with_authorization({
            endpoint: "careers",
            token,
            params,
        });
    };

    const createContactCareer = async (params, token) => {
        return helper.post_request_with_authorization({
            endpoint: "kiosk-content/careers/contacts",
            token,
            params,
        });
    };

    beforeAll(async () => {
        const orgs = ["test", "zong"];
        for await (const org of orgs) {
            // Create golf courses
            const response = await createGolfCourses(
                { ...courses[org] },
                superAdminToken,
            );
            courses[org].id = response.body.data.id;

            // Create career
            const careerCreationResponse = await createCareer({ ...careers[org], gcId: courses[org].id }, superAdminToken)
            careers[org].id = careerCreationResponse.body.data.id


            // Create device
            const deviceCreationResponse = await createDevice({
                serial: uuid(),
                pin_code: 1111,
                device_type: product.products.kiosk.id,
            });
            const deviceId = deviceCreationResponse.body.data.id;
            const deviceToken = deviceCreationResponse.body.data.device_token.split(" ")[1];

            if (org != "test") {
                await DevicesServices.update(deviceId, { owner_id: zongOrganizationId })
            }
            
            // link device with the golf course
            await DevicesServices.update(deviceId, { gcId: courses[org].id})

            // Create contact career
            const contactCareerBody = {
                careerId: careers[org].id,
                email: `example${org}@xyz.com`,
            }
            await createContactCareer(
                {
                    ...contactCareerBody,

                }, deviceToken)
            
            contactCareers[org] = {
                ...contactCareerBody,
            }
        }
    });

    it("should return 400 and validation error for the invalid careerId type", async () => {
        const expectedResponse = {
            success: false,
            data: "The careerId must be an integer.",
        };
        const response = await getContactCareerByCareerId("abc", testCustomerToken);
        expect(response.body).toEqual(expectedResponse);
        expect(response.statusCode).toBe(400);
    });
    it("should return an empty array if the test organization's customer tries to get the contact requests of a career of some different organization", async () => {
        const expectedResponse = {
            success: true,
            data: [],
        };

        const response = await getContactCareerByCareerId(
            careers.zong.id,
            testCustomerToken,
        );
        expect(response.body).toEqual(expectedResponse);
        expect(response.statusCode).toBe(200);
    });

    it("should return an empty array if the super admin tries to get the contact requests of a non-existing career", async () => {
        const expectedResponse = {
            success: true,
            data: [],
        };

        const response = await getContactCareerByCareerId(
            -1,
            superAdminToken,
        );
        expect(response.body).toEqual(expectedResponse);
        expect(response.statusCode).toBe(200);
    });

    it("should return an array if the test organization's customer tries to get the contact requests of a his/her own organization's career", async () => {

        const expectedResponse = {
            careerId: careers.test.id,
            email: `exampletest@xyz.com`,
            orgId: testOrganizatonId,
            gcId: courses.test.id
        }
        const response = await getContactCareerByCareerId(
            careers.test.id,
            testCustomerToken,
        );
        expect(response.body.data).toEqual(expect.arrayContaining([expect.objectContaining(expectedResponse)]));
        expect(response.body.success).toEqual(true);
        expect(response.statusCode).toBe(200);
    });

    it("should return an array if the test organization's customer tries to get the contact requests of a his/her own organization's career", async () => {

        const expectedResponse = {
            careerId: careers.test.id,
            email: `exampletest@xyz.com`,
            orgId: testOrganizatonId,
            gcId: courses.test.id
        }
        const response = await getContactCareerByCareerId(
            careers.test.id,
            testCustomerToken,
        );
        expect(response.body.data).toEqual(expect.arrayContaining([expect.objectContaining(expectedResponse)]));
        expect(response.body.success).toEqual(true);
        expect(response.statusCode).toBe(200);
    });

    it("should return an array if the super admin tries to get the contact requests of a any existing career", async () => {

        const expectedResponse = {
            careerId: careers.zong.id,
            email: `examplezong@xyz.com`,
            orgId: zongOrganizationId,
            gcId: courses.zong.id
        }
        const response = await getContactCareerByCareerId(
            careers.zong.id,
            superAdminToken,
        );
        expect(response.body.data).toEqual(expect.arrayContaining([expect.objectContaining(expectedResponse)]));
        expect(response.body.success).toEqual(true);
        expect(response.statusCode).toBe(200);
    });
    
});
