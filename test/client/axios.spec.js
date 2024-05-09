// test/l402Interceptor.test.js
const { expect } = require('chai');
const nock = require('nock');
const axios = require('axios');
const { setupL402Interceptor } = require('../../dist');
const { Wallet, Store, PaymentResult } = require('../../dist');

// Mock classes to simulate Wallet and Store
class MockWallet extends Wallet {
    payInvoice(invoice) {
      // Simulate successful payment with a known preimage
      return new PaymentResult('mock-preimage', true);
    }
  }
  
  class MockStore extends Store {
    constructor() {
      super();
      this.tokens = {};
    }
  
    put(url, token) {
      this.tokens[url] = token;
    }
  
    get(url) {
      return this.tokens[url] || null;
    }
  }
  
  describe('L402 Interceptor', () => {
    let instance;
    let wallet;
    let store;
  
    beforeEach(() => {
      // Create a new Axios instance
      instance = axios.create();
  
      // Initialize the mocked wallet and store
      wallet = new MockWallet();
      store = new MockStore();
  
      // Set up the interceptor
      setupL402Interceptor(instance, wallet, store);
    });
  
    afterEach(() => {
      // Clean up all nock interceptors after each test
      nock.cleanAll();
    });
  
    it('should set an Authorization header with the stored token', async () => {
      // Arrange: Add a token to the store
      const url = 'https://example.com/resource';
      store.put(url, 'mock-token');
  
      // Mock the HTTP request to return a 200 response
      nock('https://example.com')
        .get('/resource')
        .reply(200, 'response data');
  
      // Act: Make a GET request
      const response = await instance.get(url);
  
      // Assert: Verify the stored token was used
      expect(response.config.headers['Authorization']).to.equal('mock-token');
    });
  
    it('should retry a request after paying an invoice', async () => {
      // Arrange: Mock the 402 response with a WWW-Authenticate header
      const url = 'https://example.com/resource';
      nock('https://example.com')
        .get('/resource')
        .reply(402, '', { 'www-authenticate': 'L402 invoice="mockinvoice" macaroon="mock-macaroon"' });
  
      // Mock the successful retry response
      nock('https://example.com')
        .get('/resource')
        .reply(200, 'response data');
  
      // Act: Make a GET request and handle the retry logic
      const response = await instance.get(url);
  
      // Assert: Verify that the Authorization header was set with the new L402 token
      expect(response.config.headers['Authorization']).to.include('L402');
      expect(response.config.headers['Authorization']).to.include('mock-preimage');
    });
  });