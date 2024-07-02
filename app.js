const express = require('express');
const app = express();
const port = 3000;

app.get('/api/users', (req, res) => {
  // This is a placeholder for a real API endpoint.
  // It returns a mock user data.
  const users = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Doe' }
  ];
  res.json(users);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});