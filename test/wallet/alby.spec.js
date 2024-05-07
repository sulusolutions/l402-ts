// test/albyWallet.test.js
const { expect } = require('chai');
const sinon = require('sinon');

// Import the AlbyWallet and PaymentResult classes
const { AlbyWallet } = require('../../dist');
const { PaymentResult } = require('../../dist');

// Import the Alby Client class
const { Client } = require('@getalby/sdk');

describe('AlbyWallet', () => {
  let mockClient;
  let wallet;

  beforeEach(() => {
    // Create a mock client instance
    mockClient = sinon.createStubInstance(Client);

    // Initialize the AlbyWallet instance with the mocked client
    wallet = new AlbyWallet(mockClient);
  });

  it('should successfully pay an invoice', async () => {
    // Arrange: Mock the sendPayment method to return a successful payment response
    const mockResponse = {
      payment_preimage: 'example-preimage',
    };
    mockClient.sendPayment.resolves(mockResponse);

    // Act: Call the payInvoice method
    const result = await wallet.payInvoice('example-invoice');

    // Assert: Validate the PaymentResult
    expect(result).to.be.an.instanceOf(PaymentResult);
    expect(result.success).to.be.true;
    expect(result.preimage).to.equal('example-preimage');
    expect(result.error).to.be.undefined;
  });

  it('should handle payment errors gracefully', async () => {
    // Arrange: Mock the sendPayment method to reject with an error
    const error = new Error('Payment failed');
    mockClient.sendPayment.rejects(error);

    // Act: Call the payInvoice method
    const result = await wallet.payInvoice('example-invoice');

    // Assert: Validate the PaymentResult
    expect(result).to.be.an.instanceOf(PaymentResult);
    expect(result.success).to.be.false;
    expect(result.preimage).to.be.empty;
    expect(result.error).to.equal('Payment failed');
  });
});
