// Loads the necessary environment and template.
import { wpLoad, wp, templateLoader } from './wp-load.js';

let wpDidHeader = false;

if (!wpDidHeader) {
  wpDidHeader = true;

  // Load the WordPress library
  wpLoad();

  // Set up the WordPress query.
  wp();

  // Load the theme template.
  templateLoader();
}
