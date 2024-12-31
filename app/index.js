// index.js
// Front to the Node.js application. This script sets up an Express server
// and serves the appropriate content.

import express from 'express';
import path from 'path';

// Initialize express app
const app = express();

// Set the port
const PORT = process.env.PORT || 3000;

// Middleware to serve static files similar to `wp-blog-header.php` functionality
// assuming that necessary static contents are organized in "public" directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Root route serving static files
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: path.join(process.cwd(), 'public') });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
