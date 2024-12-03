/**
 * Entry point for the Express application. This file initializes the app and 
 * loads the necessary modules, similar to the wp-blog-header in WordPress.
 *
 * @package ExpressApp
 */

import express from 'express';
import path from 'path';

// Import the wp-blog-header equivalent logic, if needed
import './wp-blog-header.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Set static folder
app.use(express.static(path.resolve('public')));

// Example route
app.get('/', (req, res) => {
  res.send('Welcome to the Express app!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


