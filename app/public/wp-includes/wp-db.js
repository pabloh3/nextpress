/**
 * WordPress database access abstraction module.
 *
 * This file is deprecated, use 'wp-includes/class-wpdb.js' instead.
 *
 * @deprecated 6.1.0
 * @package WordPress
 */

// Assuming a function `deprecatedFile` exists for handling deprecations
import { deprecatedFile } from './utils.js';

// Deprecate current file
if (typeof deprecatedFile === 'function') {
  deprecatedFile('wp-db.js', '6.1.0', 'wp-includes/class-wpdb.js');
}

// Import wpdb class
import wpdb from './class-wpdb.js';

export default wpdb;
