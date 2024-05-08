// Abstract class representing the Store interface
export abstract class Store {
    /**
     * Saves a token against a specified host, path, and optionally method.
     * @param url URL string to associate with the token
     * @param token The token string to store
     * @param method Optional HTTP method associated with the token
     */
    abstract put(url: string, token: string, method?: string): void;
  
    /**
     * Looks for a token that matches the given host, path, and optionally method.
     * Returns the most relevant token if available, or null otherwise.
     * @param url URL string to search for a token
     * @param method Optional HTTP method associated with the token
     * @returns The token found or null if none matches
     */
    abstract get(url: string, method?: string): string | null;
  
    /**
     * Removes a token that matches the given host, path, and optionally method.
     * @param url URL string to remove its associated token
     * @param method Optional HTTP method associated with the token
     * @returns True if a token was removed, otherwise false
     */
    abstract delete(url: string, method?: string): boolean;
  }
  
type KeyMode = 'hostname-only' | 'hostname-path' | 'hostname-path-method';

interface TokenStoreOptions {
  keyMode: KeyMode;
}

// Concrete implementation of the Store using an in-memory structure
export class MemoryTokenStore extends Store {
    private tokens = new Map<string, string>();
    private keyMode: KeyMode;
  
    /**
     * Constructor that accepts an optional options object to set the key generation mode.
     * Defaults to 'hostname-path-method' mode if options are not provided.
     * @param options Configuration object specifying the key mode
     */
    constructor(options?: TokenStoreOptions) {
      super();
      // Set default mode to 'hostname-path-method'
      this.keyMode = options?.keyMode || 'hostname-path-method';
    }

  /**
   * Generates a key based on the configured mode.
   * @param hostname The hostname
   * @param path The URL path
   * @param method Optional HTTP method
   * @returns A combined string key based on the mode
   */
  private generateKey(hostname: string | null, path: string, method?: string): string {
    switch (this.keyMode) {
      case 'hostname-only':
        return `${hostname || 'null'}`;
      case 'hostname-path':
        return `${hostname || 'null'}:${path}`;
      case 'hostname-path-method':
      default:
        return `${hostname || 'null'}:${path}:${method || 'GET'}`;
    }
  }

  // Save the token in the map using the configured key mode
  put(urlStr: string, token: string, method: string = 'GET'): void {
    try {
      const parsedUrl = new URL(urlStr);
      const key = this.generateKey(parsedUrl.hostname, parsedUrl.pathname, method);
      this.tokens.set(key, token);
    } catch (e) {
      console.error(`Invalid URL: ${urlStr}`);
    }
  }

  // Retrieve the token if available or return null using the configured key mode
  get(urlStr: string, method: string = 'GET'): string | null {
    try {
      const parsedUrl = new URL(urlStr);
      const key = this.generateKey(parsedUrl.hostname, parsedUrl.pathname, method);
      return this.tokens.get(key) || null;
    } catch (e) {
      console.error(`Invalid URL: ${urlStr}`);
      return null;
    }
  }

  // Remove the token if the URL's hostname, path, and method match any stored key
  delete(urlStr: string, method: string = 'GET'): boolean {
    try {
      const parsedUrl = new URL(urlStr);
      const key = this.generateKey(parsedUrl.hostname, parsedUrl.pathname, method);
      return this.tokens.delete(key);
    } catch (e) {
      console.error(`Invalid URL: ${urlStr}`);
      return false;
    }
  }
}
  