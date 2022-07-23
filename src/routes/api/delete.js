/**
 * Delete a fragment for the current user
 */
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    await Fragment.byId(req.user, req.params.id);
    await Fragment.delete(req.user, req.params.id);
    res.status(200).json(createSuccessResponse());
  } catch (err) {
    res.status(404).json(createErrorResponse(404, err.message));
  }
};
