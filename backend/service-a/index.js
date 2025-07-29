const express = require('express');
const app = express();
const PORT = 3001;

app.get('/health', (req, res) => {
  res.json({ service: 'A', status: 'Up' });
});

app.listen(PORT, () => {
  console.log(`Service A running on port ${PORT}`);
});
