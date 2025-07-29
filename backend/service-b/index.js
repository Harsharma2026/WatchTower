const express = require('express');
const app = express();
const PORT = 3002;

app.get('/health', (req, res) => {
  res.json({ service: 'B', status: 'Up' });
});

app.listen(PORT, () => {
  console.log(`Service B running on port ${PORT}`);
});
