const express = require('express');
const cors = require('cors');
const assignRouter = require('./routes/assign');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/assign', assignRouter);

app.listen(PORT, () => {
  console.log(`TAFlow Optimizer backend running on port ${PORT}`);
});
