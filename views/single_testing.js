// File: single_testing.js

/**
 * Single Testing Page
 *
 * This script renders a basic HTML page with placeholders for Post title and content.
 */

import express from 'express';
import path from 'path';

const app = express();

app.set('views', './views');
app.set('view engine', 'pug');

const siteName = 'Your Site Name';

app.get('/single-testing', (req, res) => {
  res.render('single_testing', {
    siteTitle: siteName,
    currentYear: new Date().getFullYear(),
    posts: [
      { title: 'Post Title 1', content: 'Content for the first post.' },
      { title: 'Post Title 2', content: 'Content for the second post.' },
    ],
  });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});


