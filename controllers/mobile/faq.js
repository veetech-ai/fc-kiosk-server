// External Module Imports
//const Validator = require("validatorjs");
const apiResponse = require("../../common/api.response");
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
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/FAQ'
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
