/**
 * Node.js database access abstraction class.
 *
 * This file is deprecated, use 'class-wpdb.js' instead.
 *
 * @deprecated 6.1.0
 */

import { deprecatedFile } from './utils'; // Assuming there's a function to handle deprecated files
import WPDB from './class-wpdb.js';

const __filename = fileURLToPath(import.meta.url);

// Handle deprecation notice
if (typeof deprecatedFile === 'function') {
  deprecatedFile(__filename, '6.1.0', 'class-wpdb.js');
}

export default WPDB;