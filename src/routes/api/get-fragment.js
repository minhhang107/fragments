const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    const fragmentData = await fragment.getData();
    res.setHeader('Content-Type', fragment.type);
    res.status(200).send(fragmentData);
    logger.info(
      { fragmentData: fragmentData, contentType: fragment.type },
      `successfully get fragment data`
    );
  } catch (err) {
    logger.error({ err }, 'Error getting fragment by id');
    res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};
