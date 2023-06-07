// External Module Imports
//const Validator = require("validatorjs");
const apiResponse = require("../../common/api.response");
const { validateObject } = require("../../common/helper");
const faqServices = require("../../services/mobile/faq");

/**
 * @swagger
 * tags:
 *   name: FAQs
 *   description: FAQs API's
 */

exports.getFaqs = async (req, res) => {
  /**
   * @swagger
   *
   * /faq:
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
   * /faq/{id}:
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
