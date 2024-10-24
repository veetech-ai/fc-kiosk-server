const SQModel = require("../services/security_questions");
const UserSQAnswerModel = require("../services/user_sq_answers");
const UserModel = require("../services/user");

const apiResponse = require("../common/api.response");
const Validator = require("validatorjs");

/**
 * //@swagger
 * tags:
 *   name: Security Questions
 *   description: Security Questions Management
 */

exports.list = async (req, res) => {
  /**
   * //@swagger
   *
   * /security-questions:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get security questions
   *     tags: [Security Questions]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const questions = await SQModel.list();
    return apiResponse.success(res, req, questions);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.user_questions_answers = async (req, res) => {
  /**
   * //@swagger
   *
   * /security-questions/user/with-answer:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get user security questions with answers
   *     tags: [Security Questions]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const questionsWithAnswers = await UserSQAnswerModel.findByUserID(
      req.user.id,
    );

    if (questionsWithAnswers) {
      return apiResponse.success(res, req, questionsWithAnswers);
    } else {
      return apiResponse.fail(res, "Data not found");
    }
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.user_questions = (req, res) => {
  /**
   * //@swagger
   *
   * /security-questions/user:
   *   get:
   *     security: []
   *     description: Get user security questions with answers
   *     tags: [Security Questions]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: User Email
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

  const validation = new Validator(req.query, {
    email: "required|email",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      const user = await UserModel.findByEmail(req.query.email);

      const questionsWithAnswers =
        await UserSQAnswerModel.findByUserIDWithoutAnswer(user.id);

      if (questionsWithAnswers)
        return apiResponse.success(res, req, questionsWithAnswers);

      return apiResponse.fail(res, "Data not found");
    } catch (err) {
      if (err.message == "invalidEmail")
        return apiResponse.fail(res, "Email not found");

      return apiResponse.fail(res, err.message || err);
    }
  });
};

exports.save_user_answer = (req, res) => {
  /**
   * //@swagger
   *
   * /security-questions/user/answer:
   *   post:
   *     security:
   *       - auth: []
   *     description: Save user question
   *     tags: [Security Questions]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: question_id
   *         description: Question ID
   *         in: formData
   *         required: true
   *         type: number
   *       - name: answer
   *         description: Answer
   *         in: formData
   *         required: true
   *         type: string
   *       - name: answer_number
   *         description: 1=for question number one ans, 2=for question number two ans and 3=for question number three ans
   *         in: formData
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */

  const validation = new Validator(req.body, {
    question_id: "required",
    answer: "required",
    answer_number: "required",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      req.body.user_id = req.user.id;

      const result = await UserSQAnswerModel.save(req.body);
      return apiResponse.success(res, req, result);
    } catch (err) {
      return apiResponse.fail(res, err.message, 500);
    }
  });
};

exports.validate_user_answer = (req, res) => {
  /**
   * //@swagger
   *
   * /security-questions/user/validate/answer:
   *   post:
   *     security: []
   *     description: Validate user answer
   *     tags: [Security Questions]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: User Email
   *         in: formData
   *         required: true
   *         type: string
   *       - name: question_id
   *         description: Question ID
   *         in: formData
   *         required: true
   *         type: number
   *       - name: answer
   *         description: Answer
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

  const validation = new Validator(req.body, {
    email: "required|email",
    question_id: "required",
    answer: "required",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      const user = await UserModel.findByEmail(req.body.email);

      req.body.user_id = user.id;

      const result = await UserSQAnswerModel.validate(req.body);

      if (result) return apiResponse.success(res, req, "validated");

      return apiResponse.fail(res, "Invalid security question answer");
    } catch (err) {
      if (err == "invalidEmail")
        return apiResponse.fail(res, "Email not found");

      return apiResponse.fail(res, err.message || err);
    }
  });
};
