/**
 * Entry point to the Express application. This file sets up the Express server
 * and serves static files.
 */

import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
const __dirname = path.resolve(); // Use path.resolve to define __dirname
app.use(express.static(path.join(__dirname, 'public')));

// Placeholder for future routing to handle dynamic content
a}

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
