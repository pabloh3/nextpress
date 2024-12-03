/**
 * WordPress database access abstraction class.
 *
 * This file is deprecated, use 'wp-includes/class-wpdb.js' instead.
 *
 * @deprecated 6.1.0
 */

import { deprecatedFile } from './utils';
import { wpdb } from './class-wpdb.js';

if (typeof deprecatedFile === 'function') {
  // Note: WPINC may not be defined yet, so 'wp-includes' is used here.
  deprecatedFile('wp-db', '6.1.0', 'wp-includes/class-wpdb.js');
}

export default wpdb;
