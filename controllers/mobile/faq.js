// External Module Imports
const Validator = require("validatorjs");
const apiResponse = require("../../common/api.response");
const { validateObject } = require("../../common/helper");
const faqServices = require("../../services/mobile/faq");
const helpers = require("../../common/helper");

/**
 * @swagger
 * tags:
 *   name: FAQs
 *   description: FAQs API's
 */

exports.createFAQ = async (req, res) => {
  /**
   * @swagger
   *
   * /faqs:
   *   post:
   *     security:
   *       - auth: []
   *     summary: Create a new FAQ.
   *     description: Creates a new FAQ.
   *     tags: [FAQs]
   *     parameters:
   *       - in: body
   *         name: body
   *         description: FAQ data.
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             question:
   *               type: string
   *               description: The question.
   *             answer:
   *               type: string
   *               description: The answer.
   *     responses:
   *       201:
   *         description: Success. Returns the created FAQ.
   *       400:
   *         description: Bad Request. The request body is missing or invalid.
   *       500:
   *         description: Internal Server Error. An unexpected error occurred.
   */
  try {
    const validation = new Validator(req.body, {
      question: "required|string",
      answer: "required|string",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }
    const { question, answer } = req.body;

    // Create the FAQ
    const newFAQ = await faqServices.createFAQ({ question, answer });

    return apiResponse.success(res, req, newFAQ, 201);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.getFaqs = async (req, res) => {
  /**
   * @swagger
   *
   * /faqs:
   *   get:
   *     security:
   *      - auth: []
   *     summary: Retrieves FAQs.
   *     description: Retrieves a list of frequently asked questions.
   *     tags: [FAQs]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *       500:
   *         description: Internal Server Error
   */
  try {
    const faqs = await faqServices.getFAQs();

    return apiResponse.success(res, req, faqs);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.updateFAQ = async (req, res) => {
  /**
   * @swagger
   *
   * /faqs/{id}:
   *   put:
   *     security:
   *       - auth: []
   *     summary: Update an FAQ.
   *     description: Updates an existing FAQ.
   *     tags: [FAQs]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID of the FAQ to update.
   *       - in: body
   *         name: body
   *         description: Updated FAQ data.
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             question:
   *               type: string
   *               description: The updated question.
   *             answer:
   *               type: string
   *               description: The updated answer.
   *     responses:
   *       200:
   *         description: Success. Returns the updated FAQ.
   *       400:
   *         description: Bad Request. The request body is missing or invalid.
   *       404:
   *         description: Not Found. The FAQ with the specified ID was not found.
   *       500:
   *         description: Internal Server Error. An unexpected error occurred.
   */

  try {
    const { id } = req.params;
    const filteredBody = validateObject(req.body, ["question", "answer"]);

    // Update the FAQ
    const noOfAffectedRows = await faqServices.updateFAQ(id, filteredBody);

    return apiResponse.success(
      res,
      req,
      noOfAffectedRows ? "FAQ updated successfully" : "FAQ already up to date",
    );
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.deleteFAQ = async (req, res) => {
  /**
   * @swagger
   *
   * /faqs/{id}:
   *   delete:
   *     security:
   *       - auth: []
   *     summary: Delete an FAQ.
   *     description: Deletes an existing FAQ.
   *     tags: [FAQs]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID of the FAQ to delete.
   *     responses:
   *       204:
   *         description: Success. The FAQ was deleted.
   *       404:
   *         description: Not Found. The FAQ with the specified ID was not found.
   *       500:
   *         description: Internal Server Error. An unexpected error occurred.
   */
  try {
    const { id } = req.params;

    // Delete the FAQ
    await faqServices.deleteOneFAQ(id);

    return apiResponse.success(res, req, "FAQ deleted successfully");
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
