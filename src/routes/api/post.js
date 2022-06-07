const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
// const logger = require('../../logger');

module.exports = async (req, res) => {
  const apiUrl = process.env.API_URL || 'https://localhost:8080';

  try {
    let fragment = new Fragment({
      ownerId: req.user,
      type: req.get('Content-Type'),
      size: Buffer.byteLength(req.body),
    });

    await fragment.save();
    await fragment.setData(Buffer.from(req.body));

    res.set({
      Location: `${apiUrl}/v1/fragments/${fragment.id}`,
    });

    res.status(201).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.error({ err }, 'Error posting fragment');
    res.status(415).json(createErrorResponse(415, 'Type not supported'));
  }
};
