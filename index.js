
require('dotenv').config();
const express = require('express');
const path = require('path');

const { processAndSave } = require('./src/processCsv');
const { getTotalUsers, clearUsers } = require('./db/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'CSV-to-JSON API ready',
    endpoints: {
      '/upload': 'Process CSV file and store in database',
      '/stats': 'Get database statistics',
      '/clear': 'Clear all users from database'
    }
  });
});

app.get('/upload', async (req, res) => {
  const csvPath = './data/users.csv';
  try {
    console.log('Starting CSV processing for', csvPath);
    const dist = await processAndSave(csvPath);

    console.log('\n=== Age-Group % Distribution ===');
    console.log(`< 20: ${dist['<20']}%`);
    console.log(`20 to 40: ${dist['20-40']}%`);
    console.log(`40 to 60: ${dist['40-60']}%`);
    console.log(`> 60: ${dist['>60']}%`);


    const totalUsers = await getTotalUsers();

    res.json({ 
      message: 'CSV processed successfully', 
      distribution: dist,
      totalUsers: totalUsers
    });
  } catch (err) {
    console.error('Error processing CSV:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/stats', async (req, res) => {
  try {
    const totalUsers = await getTotalUsers();
    res.json({
      totalUsers: totalUsers,
      message: 'Database statistics retrieved successfully'
    });
  } catch (err) {
    console.error('Error getting stats:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/clear', async (req, res) => {
  try {
    await clearUsers();
    res.json({ message: 'All users cleared from database' });
  } catch (err) {
    console.error('Error clearing users:', err);
    res.status(500).json({ error: err.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Visit http://localhost:${PORT} for API documentation`);
  console.log(` CSV file path: ./data/users.csv`);
});
