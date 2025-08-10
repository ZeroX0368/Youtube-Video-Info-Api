const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration
const API_KEY = '1b692718-1beb-4673-9965-7b6164df5fe9';
const API_ENDPOINT = 'https://api.loopy5418.dev/yt-search';

// Middleware
app.use(express.static('public'));
app.use(express.json());

// API endpoint to get video info
app.get('/api/info', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    // Build API URL
    const url = new URL(API_ENDPOINT);
    url.searchParams.set('query', query);

    // Make API request
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'API-KEY': API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();

    // Process results
    const processedResults = [];

    for (const key in data) {
      if (key === 'success') continue;

      const item = data[key];
      if (item && item.title) {
        processedResults.push({
          id: item.videoId || key,
          title: item.title || 'No video title',
          channel: item.channel || 'Unknown channel',
          thumbnail: item.thumbnail || 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          link: item.link || `https://www.youtube.com/watch?v=${item.videoId || key}`,
          views: item.views || 'Unknown views',
          duration: item.duration || '--:--'
        });
      }
    }

    res.json({
      success: true,
      query: query,
      count: processedResults.length,
      results: processedResults
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/info?query=your_search_term`);
});
