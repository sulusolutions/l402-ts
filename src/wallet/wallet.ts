export class PaymentResult {
    preimage: string;
    success: boolean;
    error?: string;

    constructor(preimage: string, success: boolean, error?: string) {
        this.preimage = preimage;
        this.success = success;
        this.error = error;
    }
}

export abstract class Wallet {
    /**
     * Attempts to pay the given invoice and returns the result.
     * Should handle necessary logic like decoding the invoice, making the payment through the wallet's API,
     * and returning the preimage if successful.
     */
    abstract payInvoice(invoice: string): Promise<PaymentResult>;
}