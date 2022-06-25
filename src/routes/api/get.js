/**
 * Get a list of fragments for the current user
 */
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const path = require('path');

async function getFragments(req, res) {
  try {
    let fragments;
    fragments = await Fragment.byUser(req.user, req.query.expand);
    res.status(200).json(createSuccessResponse({ fragments: fragments }));
  } catch (err) {
    res.status(404).json(createErrorResponse(404, 'An error occurs'));
  }
}

async function getFragment(req, res) {
  let pathName = path.parse(req.params.id);
  let ext = pathName.ext.split('.').pop();
  let type = Fragment.extToType(ext);
  let id = pathName.name;

  try {
    const fragment = await Fragment.byId(req.user, id);
    const fragmentData = await fragment.getData();

    if (type === '') {
      res.setHeader('Content-Type', fragment.type);
      res.status(200).send(fragmentData);
      logger.info(
        { fragmentData: fragmentData, contentType: fragment.type },
        `successfully get fragment data`
      );
      return;
    }

    if (!Fragment.isSupportedType(type) || !fragment.formats.includes(type)) {
      res.status(415).json(createErrorResponse(415, 'Unsupported conversion type!'));
    } else {
      let MarkdownIt = require('markdown-it');
      let md = new MarkdownIt();
      let result = md.render(fragmentData.toString());

      res.setHeader('Content-Type', type);
      res.status(200).send(result);
      logger.info(
        { convertedFragmentData: result, contentType: type },
        `successfully convert fragment data`
      );
    }
  } catch (err) {
    logger.error({ err }, 'Error getting fragment by id');
    res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
}

async function getFragmentInfo(req, res) {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    res.status(200).json(createSuccessResponse({ fragment: fragment }));
  } catch (err) {
    res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
}

module.exports.getFragment = getFragment;
module.exports.getFragments = getFragments;
module.exports.getFragmentInfo = getFragmentInfo;
