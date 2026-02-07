export interface Filesystem {
    /**
     * Write contents to a file.
     */
    put(path: string, contents: string | Buffer): Promise<void>;

    /**
     * Read file contents.
     */
    get(path: string): Promise<Buffer>;

    /**
     * Check if a file exists.
     */
    exists(path: string): Promise<boolean>;

    /**
     * Delete a file.
     */
    delete(path: string): Promise<void>;

    /**
     * Get the URL for a file.
     */
    url(path: string): string;
}
