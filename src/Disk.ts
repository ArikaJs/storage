import { Readable } from 'stream';
import { Filesystem } from './Contracts/Filesystem';
import { Pipeline } from '@arikajs/middleware';

export class Disk {
    private driver: Filesystem;
    private middlewares: any[] = [];

    constructor(driver: Filesystem) {
        this.driver = driver;
    }

    /**
     * Register middleware for this disk.
     */
    public middleware(middleware: any): this {
        this.middlewares.push(middleware);
        return this;
    }

    /**
     * Create a pipeline for an operation.
     */
    protected async runPipeline(operation: string, params: any, callback: (params: any) => Promise<any>): Promise<any> {
        if (this.middlewares.length === 0) {
            return await callback(params);
        }

        return await new Pipeline()
            .pipe(this.middlewares)
            .handle({ operation, ...params }, async (data) => {
                return await callback(data);
            });
    }

    /**
     * Write contents to a file.
     */
    public async put(path: string, contents: string | Buffer): Promise<void> {
        return await this.runPipeline('put', { path, contents }, async (data) => {
            return await this.driver.put(data.path, data.contents);
        });
    }

    /**
     * Write a stream to a file.
     */
    public async putStream(path: string, stream: Readable): Promise<void> {
        return await this.runPipeline('putStream', { path, stream }, async (data) => {
            return await this.driver.putStream(data.path, data.stream);
        });
    }

    /**
     * Read file contents.
     */
    public async get(path: string): Promise<Buffer> {
        return await this.runPipeline('get', { path }, async (data) => {
            return await this.driver.get(data.path);
        });
    }

    /**
     * Read file as a stream.
     */
    public readStream(path: string): Readable {
        // Note: readStream is tricky with async middleware.
        // For now, we return the driver stream directly or 
        // we'd need a more complex implementation for streaming middleware.
        return this.driver.readStream(path);
    }

    /**
     * Check if a file exists.
     */
    public async exists(path: string): Promise<boolean> {
        return await this.runPipeline('exists', { path }, async (data) => {
            return await this.driver.exists(data.path);
        });
    }

    /**
     * Delete a file.
     */
    public async delete(path: string): Promise<void> {
        return await this.runPipeline('delete', { path }, async (data) => {
            return await this.driver.delete(data.path);
        });
    }

    /**
     * Get the URL for a file.
     */
    public url(path: string): string {
        return this.driver.url(path);
    }

    /**
     * Get a temporary URL for a file.
     */
    public async temporaryUrl(path: string, expiresAt: Date): Promise<string> {
        return await this.runPipeline('temporaryUrl', { path, expiresAt }, async (data) => {
            return await this.driver.temporaryUrl(data.path, data.expiresAt);
        });
    }

    /**
     * Get the file size in bytes.
     */
    public async size(path: string): Promise<number> {
        return await this.runPipeline('size', { path }, async (data) => {
            return await this.driver.size(data.path);
        });
    }

    /**
     * Get the last modified time of the file.
     */
    public async lastModified(path: string): Promise<number> {
        return await this.runPipeline('lastModified', { path }, async (data) => {
            return await this.driver.lastModified(data.path);
        });
    }

    /**
     * Get the mime type of the file.
     */
    public async mimeType(path: string): Promise<string> {
        return await this.runPipeline('mimeType', { path }, async (data) => {
            return await this.driver.mimeType(data.path);
        });
    }
}
