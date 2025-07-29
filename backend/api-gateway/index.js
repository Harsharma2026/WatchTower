const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.get('/services-health', async (req, res) => {
  try {
    const [a, b] = await Promise.all([
      axios.get('http://localhost:3001/health'),
      axios.get('http://localhost:3002/health')
    ]);
    res.json({
      serviceA: a.data,
      serviceB: b.data
    });
  } catch (error) {
    res.status(500).json({ error: 'One or more services are down' });
  }
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
