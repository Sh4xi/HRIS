import { v4 as uuidv4 } from 'uuid';

// Define a flag to track the last time the submit button was clicked
let lastSubmitTime: number | null = null;

// Function to generate a unique ticket number and disable spamming
// i allow nalang here ang function na req and bind
async function generateUniqueTicketAndDisableSpamming(req, res) {
  if (lastSubmitTime !== null && Date.now() - lastSubmitTime < 1000) {
    // If the submit button was clicked too frequently within 1 second, ignore the request
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }

  const ticketId = uuidv4();
  lastSubmitTime = Date.now();

  // Your code to handle the ticket generation and other operations goes here

  res.json({ message: 'Ticket generated successfully.', ticketId });
} 