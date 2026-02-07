import { Filesystem } from './Contracts/Filesystem';

export class Disk {
    private driver: Filesystem;

    constructor(driver: Filesystem) {
        this.driver = driver;
    }

    /**
     * Write contents to a file.
     */
    public async put(path: string, contents: string | Buffer): Promise<void> {
        return await this.driver.put(path, contents);
    }

    /**
     * Read file contents.
     */
    public async get(path: string): Promise<Buffer> {
        return await this.driver.get(path);
    }

    /**
     * Check if a file exists.
     */
    public async exists(path: string): Promise<boolean> {
        return await this.driver.exists(path);
    }

    /**
     * Delete a file.
     */
    public async delete(path: string): Promise<void> {
        return await this.driver.delete(path);
    }

    /**
     * Get the URL for a file.
     */
    public url(path: string): string {
        return this.driver.url(path);
    }
}
