const { expect } = require('chai');
const { MemoryTokenStore } = require('../../dist');

describe('MemoryTokenStore', () => {
  let store;

  describe('Default mode (hostname-path-method)', () => {
    // Initialize a new store instance before each test
    beforeEach(() => {
      store = new MemoryTokenStore(); // Default mode is 'hostname-path-method'
    });

    it('should store and retrieve a token by URL and method', () => {
      const url = 'https://example.com/api';
      const token = 'example-token';
      const method = 'POST';

      store.put(url, token, method);
      const retrievedToken = store.get(url, method);
      expect(retrievedToken).to.equal(token);
    });

    it('should return null for a non-existent URL and method', () => {
      const nonExistentUrl = 'https://example.com/non-existent';
      const method = 'GET';

      const result = store.get(nonExistentUrl, method);
      expect(result).to.be.null;
    });

    it('should delete a token by URL and method', () => {
      const url = 'https://example.com/api';
      const token = 'example-token';
      const method = 'POST';

      store.put(url, token, method);
      const wasDeleted = store.delete(url, method);
      expect(wasDeleted).to.be.true;

      const result = store.get(url, method);
      expect(result).to.be.null;
    });

    it('should return false when deleting a non-existent URL and method', () => {
      const nonExistentUrl = 'https://example.com/non-existent';
      const method = 'GET';

      const wasDeleted = store.delete(nonExistentUrl, method);
      expect(wasDeleted).to.be.false;
    });

    it('should handle different methods separately for the same URL', () => {
      const url = 'https://example.com/api';
      const getToken = 'get-token';
      const postToken = 'post-token';

      store.put(url, getToken, 'GET');
      store.put(url, postToken, 'POST');

      expect(store.get(url, 'GET')).to.equal(getToken);
      expect(store.get(url, 'POST')).to.equal(postToken);

      expect(store.delete(url, 'GET')).to.be.true;
      expect(store.get(url, 'POST')).to.equal(postToken);
      expect(store.get(url, 'GET')).to.be.null;
    });
  });

  describe('Hostname-only mode', () => {
    // Initialize a new store instance before each test
    beforeEach(() => {
      store = new MemoryTokenStore({ keyMode: 'hostname-only' });
    });

    it('should store and retrieve a token by hostname only', () => {
      const url = 'https://example.com/api';
      const token = 'example-token';

      store.put(url, token);
      const retrievedToken = store.get(url);
      expect(retrievedToken).to.equal(token);
    });

    it('should return null for a non-existent hostname', () => {
      const nonExistentUrl = 'https://nonexistent.com/api';

      const result = store.get(nonExistentUrl);
      expect(result).to.be.null;
    });

    it('should delete a token by hostname only', () => {
      const url = 'https://example.com/api';
      const token = 'example-token';

      store.put(url, token);
      const wasDeleted = store.delete(url);
      expect(wasDeleted).to.be.true;

      const result = store.get(url);
      expect(result).to.be.null;
    });

    it('should return false when deleting a non-existent hostname', () => {
      const nonExistentUrl = 'https://nonexistent.com/api';

      const wasDeleted = store.delete(nonExistentUrl);
      expect(wasDeleted).to.be.false;
    });
  });

  describe('Hostname-path mode', () => {
    // Initialize a new store instance before each test
    beforeEach(() => {
      store = new MemoryTokenStore({ keyMode: 'hostname-path' });
    });

    it('should store and retrieve a token by hostname and path', () => {
      const url = 'https://example.com/api';
      const token = 'example-token';

      store.put(url, token);
      const retrievedToken = store.get(url);
      expect(retrievedToken).to.equal(token);
    });

    it('should return null for a non-existent hostname and path', () => {
      const nonExistentUrl = 'https://example.com/non-existent';

      const result = store.get(nonExistentUrl);
      expect(result).to.be.null;
    });

    it('should delete a token by hostname and path', () => {
      const url = 'https://example.com/api';
      const token = 'example-token';

      store.put(url, token);
      const wasDeleted = store.delete(url);
      expect(wasDeleted).to.be.true;

      const result = store.get(url);
      expect(result).to.be.null;
    });

    it('should return false when deleting a non-existent hostname and path', () => {
      const nonExistentUrl = 'https://example.com/non-existent';

      const wasDeleted = store.delete(nonExistentUrl);
      expect(wasDeleted).to.be.false;
    });
  });
});
