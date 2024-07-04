import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

const PORT = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));