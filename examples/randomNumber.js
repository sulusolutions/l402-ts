// Import required dependencies
const axios = require('axios');
const { setupL402Interceptor, AlbyWallet, MemoryTokenStore } = require('../dist'); // Adjust path to your interceptor file
const { Client } = require('@getalby/sdk');
require('dotenv').config();

// Load the Alby token from an environment variable
const albyToken = process.env.ALBY_BEARER_TOKEN;
if (!albyToken) {
  console.error('Missing ALBY_BEARER_TOKEN environment variable.');
  process.exit(1);
}

const albyClient = new Client(albyToken)

// Initialize the AlbyWallet using the bearer token
const albyWallet = new AlbyWallet(albyClient);

// Initialize the MemoryTokenStore
const store = new MemoryTokenStore();

// Create an Axios instance and configure it with the L402 interceptor
const axiosInstance = axios.create({
  baseURL: 'https://rnd.ln.sulu.sh',
  headers: { 'Content-Type': 'application/json' },
});

// Set up the L402 interceptor with the real Alby wallet and token store
setupL402Interceptor(axiosInstance, albyWallet, store);

// Function to fetch a random number using the configured Axios instance
async function fetchRandomNumber() {
  try {
    // Make a GET request to the random number API
    const response = await axiosInstance.get('/randomnumber');
    console.log('Random Number:', response.data);
  } catch (error) {
    // Handle errors gracefully
    if (axios.isAxiosError(error)) {
      console.error('Axios Error:', error.message, error.response?.status);
    } else {
      console.error('Unknown Error:', error);
    }
  }
}

// Execute the function to fetch the random number
fetchRandomNumber();
