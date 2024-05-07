// Assuming the Wallet and PaymentResult classes are in a file named `wallet.ts`
// Import the abstract Wallet class and PaymentResult
import { Wallet, PaymentResult } from './wallet';

// Import the Client class from the Alby SDK
import { Client } from '@getalby/sdk';
import { SendPaymentResponse } from '@getalby/sdk/dist/types';

export class AlbyWallet extends Wallet {
    private client: Client;
  
    // Accept a pre-configured Alby Client object in the constructor
    constructor(client: Client) {
      super();
      // Assign the provided client to the local property
      this.client = client;
    }
  
    // Implement the abstract payInvoice method
    async payInvoice(invoice: string): Promise<PaymentResult> {
      try {
        // Use the Alby SDK to send the payment
        const response: SendPaymentResponse = await this.client.sendPayment({
          invoice: invoice,
        });
  
        // If successful, return the preimage and success status
        return new PaymentResult(response.payment_preimage || '', true);
      } catch (error) {
        // In case of errors, return a PaymentResult with an error message
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new PaymentResult('', false, errorMessage);
      }
    }
  }