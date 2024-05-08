![Build Status](https://github.com/sulusolutions/l402-ts/actions/workflows/ci.yml/badge.svg)

# l402: JavaScript Tools for L402 Protocol Integration
`l402` is a comprehensive JavaScript package designed to simplify the integration and handling of L402 protocol payments within the Lightning Network ecosystem. The SDK provides convenient abstractions for wallet interactions, invoice payments, and token management, making it an essential tool for developers working on JavaScript applications requiring L402 API access.

__Features__:
- L402 Axios Interceptor: A composable L402 HTTP interceptor that can be used with Axios to handle L402 API requests and payments.
- Wallet Interface: Facilitates invoice payments through various wallet implementations, starting with Alby wallet support.
- Token Store Interface: Manages and stores L402 tokens, allowing for efficient retrieval based on different URL matching strategies such as hostname-only, hostname + path, or hostname + path + method.

## Getting Started

### Prerequisites
- **Node.js** version 14 or higher
- Access to an L402-compliant API: check-out [this](https://docs.sulu.sh) for some inpiration.

### Installation
Install `l402` using npm:

```bash
npm install l402
```

## Example Usage
Here's how to use the L402 interceptor with the Alby wallet to access the `rnd.ln.sulu.sh/randomnumber` API, which returns a random number.

1. **Prepare your environment**

    Make sure the ALBY_BEARER_TOKEN environment variable is set with your Alby wallet bearer token.

2. **Code**

```js
const axios = require('axios');
const { setupL402Interceptor, AlbyWallet, MemoryTokenStore } = require('l402'); 
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
```

## More Info

**Learn More About L402 Protocol**: For detailed information about the L402 protocol and how it works, visit the documentation at [docs.sulu.sh](https://docs.sulu.sh).

**Transform Your API into an L402 API**: If you're interested in turning your own APIs into L402 APIs, head over to [www.sulu.sh](https://www.sulu.sh) to get started and explore the available solutions such as Sparkwall and Sparkhub

## Contributions

Contributions are welcome! We're looking for support in the following areas:

- **Other JavaScript HTTP Clients**: Expand the reach of `l402` by adding support for other popular JavaScript HTTP clients.
- **More Wallet Integrations**: Help us integrate additional wallet implementations, making it easier for developers to use their preferred wallet with the L402 protocol.
- **Applications Using This Technology**: Build innovative applications that leverage L402, showcasing its potential and usability.

If you're interested in contributing, please review the project's guidelines and submit a pull request or issue to start the conversation.

## Disclaimer

This project is provided "as-is" and without any warranty, express or implied. While every effort has been made to ensure that the provided software is reliable and secure, the authors and contributors are not liable for any damages or losses resulting from the use or misuse of this software.

- **Security**: Ensure that sensitive data such as API keys, bearer tokens, and wallet credentials are stored securely and not exposed in public code repositories.
- **Regulatory Compliance**: It's your responsibility to ensure that your application complies with local and international regulations when using the Lightning Network and any payment protocols.

Use this software responsibly and always adhere to best practices in security and compliance.

