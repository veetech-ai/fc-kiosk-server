// Common Imports
const helper = require("../../common/helper");

exports.get_courses = async (queryParams, apiUrl) => {
  const response = await helper.call_golfbert_api(apiUrl, queryParams);
  return response.data;
};

exports.get_course_by_id = async (queryParams, apiUrl) => {
  const response = await helper.call_golfbert_api(apiUrl, queryParams);
  return response.data;
};

exports.get_holes_by_courseId = async (queryParams, apiUrl) => {
  const response = await helper.call_golfbert_api(apiUrl, queryParams);
  return response.data;
};

exports.get_scorecard_by_courseId = async (queryParams, apiUrl) => {
  const response = await helper.call_golfbert_api(apiUrl, queryParams);
  return response.data;
};

exports.get_teeboxes_by_courseId = async (queryParams, apiUrl) => {
  const response = await helper.call_golfbert_api(apiUrl, queryParams);
  return response.data;
};

exports.get_holes = async (queryParams, apiUrl) => {
  const response = await helper.call_golfbert_api(apiUrl, queryParams);
  return response.data;
};

exports.get_holes_by_holeId = async (queryParams, apiUrl) => {
  const response = await helper.call_golfbert_api(apiUrl, queryParams);
  return response.data;
};

exports.get_polygons_by_holeId = async (queryParams, apiUrl) => {
  const response = await helper.call_golfbert_api(apiUrl, queryParams);
  return response.data;
};

exports.get_teeboxes_by_holeId = async (queryParams, apiUrl) => {
  const response = await helper.call_golfbert_api(apiUrl, queryParams);
  return response.data;
};

exports.get_teeboxcolors = async (queryParams, apiUrl) => {
  const response = await helper.call_golfbert_api(apiUrl, queryParams);
  return response.data;
};

exports.get_teeboxtypes = async (queryParams, apiUrl) => {
  const response = await helper.call_golfbert_api(apiUrl, queryParams);
  return response.data;
};
