const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const apiUrl = process.env.API_URL || 'https://localhost:8080';

  try {
    const fragment = await Fragment.byId(req.user, req.params.id);

    if (req.get('content-type') != fragment.type) {
      res
        .status(400)
        .json(
          createErrorResponse(400, 'A fragment’s type can not be changed after it is created.')
        );
      return;
    }

    fragment.setData(req.body);
    res.set({
      Location: `${apiUrl}/v1/fragments/${fragment.id}`,
    });
    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.error({ err }, 'Error getting fragment by id');
    res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};
