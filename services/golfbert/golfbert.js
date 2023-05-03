// Common Imports
const helper = require("../../common/helper");
const config = require("../../config/config");
const ServiceError = require("../../utils/serviceError");

const BASE_URL = "https://api.golfbert.com/v1";

exports.get_courses = async (queryParams = {}) => {
  const API_URL = BASE_URL + "/courses";

  const response = await helper.call_golfbert_api(API_URL, queryParams);
  return response.data;
};

exports.get_course_by_id = async (courseId, queryParams = {}) => {
  const API_URL = `${BASE_URL}/courses/${courseId}`;

  const response = await helper.call_golfbert_api(API_URL, queryParams);
  return response.data;
};

exports.get_holes_by_courseId = async (courseId, queryParams = {}) => {
  const API_URL = BASE_URL + `/courses/${courseId}/holes`;

  const response = await helper.call_golfbert_api(API_URL, queryParams);

  if (!response.data || !response.data?.resources?.length) {
    throw new Error(
      `This course is coming soon${config.error_message_separator}404`,
    );
  }

  return response.data;
};

exports.get_scorecard_by_courseId = async (courseId, queryParams = {}) => {
  const API_URL = BASE_URL + `/courses/${courseId}/scorecard`;

  const response = await helper.call_golfbert_api(API_URL, queryParams);
  return response.data;
};

exports.get_teeboxes_by_courseId = async (courseId, queryParams = {}) => {
  const API_URL = BASE_URL + `/courses/${courseId}/teeboxes`;

  const response = await helper.call_golfbert_api(API_URL, queryParams);
  return response.data;
};

exports.get_holes = async (queryParams = {}) => {
  const API_URL = BASE_URL + `/holes`;

  const response = await helper.call_golfbert_api(API_URL, queryParams);
  return response.data;
};

exports.get_holes_by_holeId = async (holeId, queryParams = {}) => {
  const API_URL = BASE_URL + `/holes/${holeId}`;

  const response = await helper.call_golfbert_api(API_URL, queryParams);
  return response.data;
};

exports.get_polygons_by_holeId = async (holeId, queryParams = {}) => {
  const API_URL = BASE_URL + `/holes/${holeId}/polygons`;

  const response = await helper.call_golfbert_api(API_URL, queryParams);
  
  if(!response?.data || !response.data?.resources?.length) {
    throw new ServiceError(`Polygons Not Found`, 404);
  }

  return response.data;
};

exports.get_teeboxes_by_holeId = async (holeId, queryParams = {}) => {
  const API_URL = BASE_URL + `/holes/${holeId}/teeboxes`;

  const response = await helper.call_golfbert_api(API_URL, queryParams);

  if(!response?.data || !response.data?.resources?.length) {
    throw new ServiceError(`Teeboxes Not Found`, 404);
  }

  return response.data;
};

exports.get_teeboxcolors = async (queryParams = {}) => {
  const API_URL = BASE_URL + `/teeboxcolors`;

  const response = await helper.call_golfbert_api(API_URL, queryParams);
  return response.data;
};

exports.get_teeboxtypes = async (queryParams = {}) => {
  const API_URL = BASE_URL + `/teeboxtypes`;

  const response = await helper.call_golfbert_api(API_URL, queryParams);
  return response.data;
};
