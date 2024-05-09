// Import necessary dependencies
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { Wallet, PaymentResult, Store } from '../index';

/**
 * Set up an Axios interceptor to handle L402 authentication.
 * @param instance The Axios instance to attach the interceptor to
 * @param wallet The wallet implementation used to pay invoices
 * @param store The store implementation used to retrieve and store tokens
 */
export function setupL402Interceptor(instance: AxiosInstance, wallet: Wallet, store: Store): void {
  // Request interceptor to set an authorization header if a token is available
  instance.interceptors.request.use((config: InternalAxiosRequestConfig<any>) => {
    // Combine baseURL and URL into a fully qualified URL if baseURL is specified
    const url = config.baseURL ? new URL(config.url ?? '', config.baseURL).toString() : config.url;
    const method = config.method?.toUpperCase() || 'GET'; // Use 'GET' as the default method

    // Retrieve the token using the fully qualified URL and HTTP method
    const token = store.get(url || '', method);
    if (token) {
      config.headers['Authorization'] = `${token}`;
    }
    return config;
  });

  // Response interceptor to handle the 402 Payment Required status
  instance.interceptors.response.use(
    (response: AxiosResponse) => response, // Successful responses pass through unchanged
    async (error) => {
      if (axios.isAxiosError(error) && error.config && error.response && error.response.status === 402) {
        // Extract the challenge details from the WWW-Authenticate header
        const config = error.config as InternalAxiosRequestConfig<any>;
        const authHeader = error.response.headers['www-authenticate'] || '';
        const challenge = parseHeader(authHeader);

        if (challenge && challenge.invoice) {
          // Pay the invoice using the provided wallet
          const paymentResult: PaymentResult = await wallet.payInvoice(challenge.invoice);

          if (paymentResult.success) {
            // Create a new L402 token and store it
            const l402Token = `${challenge.header_key} ${challenge.macaroon}:${paymentResult.preimage}`;
            const url = config.baseURL ? new URL(config.url ?? '', config.baseURL).toString() : config.url;
            const method = config.method?.toUpperCase() || 'GET'; // Use 'GET' as the default method

            // Store the new token with the fully qualified URL and method
            store.put(url || '', l402Token, method);

            // Retry the request with the new token
            error.config.headers['Authorization'] = l402Token;
            return instance.request(error.config); // Retry the request
          }
        }
      }

      // If not a 402 error or payment was not successful, reject the promise
      return Promise.reject(error);
    }
  );
}

/**
 * Parse the WWW-Authenticate header and extract the relevant data.
 * @param header The WWW-Authenticate header string
 * @returns An object containing the extracted data or null if parsing failed
 */
function parseHeader(header: string): { header_key: string; invoice: string; macaroon: string } | null {
  const headerKeyMatch = /^(LSAT|L402)/.exec(header);
  const invoiceMatch = /invoice="([\w|\d]+)"/.exec(header); // Lightning invoice only use alphanumeric characters, see: https://github.com/lightning/bolts/blob/master/11-payment-encoding.md
  const macaroonMatch = /macaroon="([\w|\d\+\/=_-]+)"/.exec(header); // Base64 URL-safe characters

  if (invoiceMatch && macaroonMatch) {
    return {
      header_key: headerKeyMatch ? headerKeyMatch[0] : '',
      invoice: invoiceMatch[1],
      macaroon: macaroonMatch[1],
    };
  }

  return null;
}

