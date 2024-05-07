// token_store.ts

// Abstract class representing the Store interface
export abstract class Store {
    /**
     * Saves a token against a specified host and path.
     * @param url URL string to associate with the token
     * @param token The token string to store
     */
    abstract put(url: string, token: string): void;

    /**
     * Looks for a token that matches the given host and path.
     * Returns the most relevant token if available, or null otherwise.
     * @param url URL string to search for a token
     * @returns The token found or null if none matches
     */
    abstract get(url: string): string | null;

    /**
     * Removes a token that matches the given host and path.
     * @param url URL string to remove its associated token
     * @returns True if a token was removed, otherwise false
     */
    abstract delete(url: string): boolean;
}

// Concrete implementation of the Store using an in-memory structure
export class MemoryTokenStore extends Store {
    // Store tokens in a map, using a (host, path) tuple as the key
    private tokens = new Map<string, string>();

    /**
     * Converts a (hostname, path) tuple to a single string key.
     * @param hostname The hostname
     * @param path The URL path
     * @returns A combined string key
     */
    private static generateKey(hostname: string | null, path: string): string {
        return `${hostname || 'null'}:${path}`;
    }

    // Save the token in the map using the parsed hostname and path
    put(urlStr: string, token: string): void {
        try {
            const parsedUrl = new URL(urlStr);
            const key = MemoryTokenStore.generateKey(parsedUrl.hostname, parsedUrl.pathname);
            this.tokens.set(key, token);
        } catch (e) {
            console.error(`Invalid URL: ${urlStr}`);
        }
    }

    // Retrieve the token if available or return null
    get(urlStr: string): string | null {
        try {
            const parsedUrl = new URL(urlStr);
            const key = MemoryTokenStore.generateKey(parsedUrl.hostname, parsedUrl.pathname);
            return this.tokens.get(key) || null;
        } catch (e) {
            console.error(`Invalid URL: ${urlStr}`);
            return null;
        }
    }

    // Remove the token if the URL's hostname and path match any stored key
    delete(urlStr: string): boolean {
        try {
            const parsedUrl = new URL(urlStr);
            const key = MemoryTokenStore.generateKey(parsedUrl.hostname, parsedUrl.pathname);
            return this.tokens.delete(key);
        } catch (e) {
            console.error(`Invalid URL: ${urlStr}`);
            return false;
        }
    }
}
