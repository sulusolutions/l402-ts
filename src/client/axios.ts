// Import necessary dependencies
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { Wallet, PaymentResult, Store } from '../index'; 

// Define the interceptor function
export function setupL402Interceptor(instance: AxiosInstance, wallet: Wallet, store: Store): void {
  // Request interceptor to set an authorization header if a token is available
instance.interceptors.request.use((config: InternalAxiosRequestConfig<any>) => {
    const token = store.get(config.url || '');
    if (token) {
        config.headers["Authorization"] =  `${token}`;
    }
    return config;
});

  // Response interceptor to handle the 402 Payment Required status
  instance.interceptors.response.use(
    (response: AxiosResponse) => response, // Successful responses pass through unchanged
    async (error) => {
      if (axios.isAxiosError(error) && error.config && error.response && error.response.status === 402) {
        // Extract the challenge details from the WWW-Authenticate header
        const authHeader = error.response.headers['www-authenticate'] || '';
        const challenge = parseHeader(authHeader);

        if (challenge && challenge.invoice) {
          // Pay the invoice using the provided Wallet
          const paymentResult: PaymentResult = await wallet.payInvoice(challenge.invoice);

          if (paymentResult.success) {
            // Create a new L402 token and store it
            const l402Token = `${challenge.header_key} ${challenge.macaroon}:${paymentResult.preimage}`;
            store.put(error.config.url || '', l402Token);

            // Retry the request with the new token
            error.config.headers["Authorization"] = l402Token;
            return instance.request(error.config); // Retry the request
          }
        }
      }

      // If not a 402 error or payment was not successful, reject the promise
      return Promise.reject(error);
    }
  );
}

// Function to parse the WWW-Authenticate header
function parseHeader(header: string): { header_key: string; invoice: string; macaroon: string } | null {
  const headerKeyMatch = /^(LSAT|L402)/.exec(header);
  const invoiceMatch = /invoice="([^"]+)"/.exec(header);
  const macaroonMatch = /macaroon="([^"]+)"/.exec(header);

  if (invoiceMatch && macaroonMatch) {
    return {
      header_key: headerKeyMatch ? headerKeyMatch[0] : '',
      invoice: invoiceMatch[1],
      macaroon: macaroonMatch[1],
    };
  }

  return null;
}

