const { expect } = require('chai');
const { MemoryTokenStore } = require('../../dist');

describe('MemoryTokenStore', () => {
  let store;

  // Initialize a new store instance before each test
  beforeEach(() => {
    store = new MemoryTokenStore();
  });

  it('should store and retrieve a token by URL', () => {
    const url = 'https://example.com/api';
    const token = 'example-token';

    // Store the token in the memory store
    store.put(url, token);

    // Retrieve the token and verify it matches the original
    const retrievedToken = store.get(url);
    expect(retrievedToken).to.equal(token);
  });

  it('should return null for a non-existent URL', () => {
    const nonExistentUrl = 'https://example.com/non-existent';

    // Attempt to retrieve a token for a URL that wasn't stored
    const result = store.get(nonExistentUrl);
    expect(result).to.be.null;
  });

  it('should delete a token by URL', () => {
    const url = 'https://example.com/api';
    const token = 'example-token';

    // Store the token in the memory store
    store.put(url, token);

    // Delete the stored token
    const wasDeleted = store.delete(url);
    expect(wasDeleted).to.be.true;

    // Verify that the token no longer exists
    const result = store.get(url);
    expect(result).to.be.null;
  });

  it('should return false when deleting a non-existent URL', () => {
    const nonExistentUrl = 'https://example.com/non-existent';

    // Attempt to delete a token for a URL that wasn't stored
    const wasDeleted = store.delete(nonExistentUrl);
    expect(wasDeleted).to.be.false;
  });
});
