/**
 * Node.js database access abstraction class.
 *
 * This script is deprecated, use 'lib/class-wpdb.js' instead.
 *
 * @deprecated 6.1.0
 * @package Node.js
 */

import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Deprecated file handler function
 * @param {string} fileName
 * @param {string} version
 * @param {string} replacement
 */
function deprecatedFile(fileName, version, replacement) {
  console.warn(`${fileName} is deprecated since version ${version}, please use ${replacement} instead.`);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (typeof deprecatedFile === 'function') {
  deprecatedFile(path.basename(__filename), '6.1.0', 'lib/class-wpdb.js');
}

// Import wpdb class
import { wpdb } from path.join(__dirname, 'class-wpdb.js');
