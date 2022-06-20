/**
 * Get a list of fragments for the current user
 */
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    let fragments;
    fragments = await Fragment.byUser(req.user, req.query.expand);
    res.status(200).json(createSuccessResponse({ fragments: fragments }));
  } catch (err) {
    res.status(404).json(createErrorResponse(404, 'An error occurs'));
  }
};
