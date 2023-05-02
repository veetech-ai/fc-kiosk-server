// External Module Imports
const Validator = require("validatorjs");
const convert = require("convert-units");
const geolib = require("geolib");

// Common Imports
const apiResponse = require("../../common/api.response");
const models = require("../../models/index");
const helper = require("../../common/helper");
const axios = require("axios");
// Logger Imports
const { logger } = require("../../logger");
const config = require("../../config/config");
const { Op, Sequelize } = require("sequelize");
const golfbertService = require("../../services/golfbert/golfbert");
const CourseModel = models.Mobile_Course;

exports.getCourseFromDb = async (where) => {
  const courseFromDB = await CourseModel.findOne({ where });

  if (!courseFromDB) {
    throw new Error(`Course Not Found${config.error_message_separator}404`);
  }

  const golfBertCourseId = courseFromDB.golfbertId;
  if (!golfBertCourseId) {
    throw new Error(
      `Course's Golfbert Id Not Found${config.error_message_separator}404`,
    );
  }
  return courseFromDB;
};
