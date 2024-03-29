/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');
const { getFragment, getFragments, getFragmentInfo } = require('./get');
// Create a router on which to mount our API endpoints
const router = express.Router();

const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');

// Support sending various Content-Types on the body up to 5M in size
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      // See if we can parse this content type. If we can, `req.body` will be
      // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
      // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
      const { type } = contentType.parse(req);
      return Fragment.isSupportedType(type);
    },
  });

// GET routes
router.get('/fragments', getFragments);
router.get('/fragments/:id', getFragment);
router.get('/fragments/:id/info', getFragmentInfo);

// POST routes
router.post('/fragments', rawBody(), require('./post'));

// PUT routes
router.put('/fragments/:id', rawBody(), require('./put'));

// DELETE routes
router.delete('/fragments/:id', require('./delete'));

module.exports = router;
