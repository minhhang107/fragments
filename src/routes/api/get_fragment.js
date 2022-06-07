const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    const fragmentData = await fragment.getData();
    res.status(200).json(fragmentData.toString('utf8'));
  } catch (err) {
    logger.error({ err }, 'Error getting fragment by id');
    res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};
