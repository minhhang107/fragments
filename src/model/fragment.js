// Use https://www.npmjs.com/package/nanoid to create unique IDs
const { nanoid } = require('nanoid');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

const sharp = require('sharp');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

const validTypes = [
  `text/plain`,
  `text/plain; charset=utf-8`,
  `text/markdown`,
  `text/html`,
  `application/json`,
  `image/png`,
  `image/jpeg`,
  `image/webp`,
  `image/gif`,
];

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId) {
      throw new Error('ownerId is required');
    } else if (!type) {
      throw new Error('type is required');
    } else if (typeof size !== 'number') {
      throw new Error('size must be a number');
    } else if (size < 0) {
      throw new Error('size cannot be negative');
    } else if (!validTypes.some((validType) => type.includes(validType))) {
      throw new Error('type not supported');
    }

    this.id = id ? id : nanoid();
    this.ownerId = ownerId;
    this.created = created ? created : new Date().toISOString();
    this.updated = updated ? updated : new Date().toISOString();
    this.type = type;
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    try {
      const results = await listFragments(ownerId, expand);
      if (expand) {
        return results.map((fragment) => new Fragment(fragment));
      }
      return results;
    } catch (err) {
      return [];
    }
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    try {
      const fragment = await readFragment(ownerId, id);
      return new Fragment(fragment);
    } catch (err) {
      throw new Error('Fragment not found');
    }
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise
   */
  static async delete(ownerId, id) {
    try {
      return await deleteFragment(ownerId, id);
    } catch (err) {
      throw new Error('Unable to delete fragment');
    }
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise
   */
  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */

  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise
   */
  async setData(data) {
    if (!data) {
      throw new Error('Data is missing');
    }

    this.size = Buffer.byteLength(data);
    this.save();
    return await writeFragmentData(this.ownerId, this.id, data);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.type.substring(0, 4) === 'text';
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    let formats;
    let imgFormats = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (this.type.includes('text/plain')) {
      formats = ['text/plain'];
    } else if (this.type.includes('text/markdown')) {
      formats = ['text/markdown', 'text/html', 'text/plain'];
    } else if (this.type.includes('text/html')) {
      formats = ['text/html', 'text/plain'];
    } else if (this.type.includes('application/json')) {
      formats = ['application/json', 'text/plain'];
    } else if (
      this.type === 'image/png' ||
      this.type === 'image/jpeg' ||
      this.type === 'image/webp' ||
      this.type === 'image/gif'
    ) {
      formats = imgFormats;
    }
    return formats;
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    return validTypes.includes(value);
  }

  /**
   * Returns mime type
   * @returns {string} type name of the extension
   */
  static extToType(ext) {
    const extensions = ['txt', 'md', 'html', 'json', 'png', 'jpeg', 'webp', 'gif'];
    const types = [
      'text/plain',
      'text/markdown',
      'text/html',
      'application/json',
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/gif',
    ];
    const index = extensions.findIndex((extension) => extension === ext);
    return types[index];
  }

  /**
   * Returns the converted content
   * @param {Any} data the data to be converted
   * @param {string} ext the extension type to be converted into
   * @returns {Any} converted content
   */
  static convert(data, ext) {
    if (ext === 'html') {
      let MarkdownIt = require('markdown-it');
      let md = new MarkdownIt();
      return md.render(data.toString());
    }
    if (ext === 'png' || ext === 'jpeg' || ext === 'gif' || ext === 'webp') {
      return sharp(data).toFormat(ext).toBuffer();
    }

    return data;
  }
}

module.exports.Fragment = Fragment;
