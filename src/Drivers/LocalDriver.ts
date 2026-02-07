import * as fs from 'fs/promises';
import * as path from 'path';
import { Filesystem } from '../Contracts/Filesystem';
import { FileNotFoundException } from '../Exceptions/FileNotFoundException';

export class LocalDriver implements Filesystem {
    private root: string;
    private urlPrefix: string;

    constructor(config: { root: string; url?: string }) {
        this.root = path.resolve(config.root);
        this.urlPrefix = config.url || '';
    }

    /**
     * Get the full path for a file.
     */
    private getFullPath(filePath: string): string {
        return path.join(this.root, filePath);
    }

    /**
     * Ensure directory exists.
     */
    private async ensureDirectory(filePath: string): Promise<void> {
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
    }

    /**
     * Write contents to a file.
     */
    public async put(filePath: string, contents: string | Buffer): Promise<void> {
        const fullPath = this.getFullPath(filePath);
        await this.ensureDirectory(fullPath);
        await fs.writeFile(fullPath, contents);
    }

    /**
     * Read file contents.
     */
    public async get(filePath: string): Promise<Buffer> {
        const fullPath = this.getFullPath(filePath);

        if (!(await this.exists(filePath))) {
            throw new FileNotFoundException(filePath);
        }

        return await fs.readFile(fullPath);
    }

    /**
     * Check if a file exists.
     */
    public async exists(filePath: string): Promise<boolean> {
        const fullPath = this.getFullPath(filePath);

        try {
            await fs.access(fullPath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Delete a file.
     */
    public async delete(filePath: string): Promise<void> {
        const fullPath = this.getFullPath(filePath);

        if (await this.exists(filePath)) {
            await fs.unlink(fullPath);
        }
    }

    /**
     * Get the URL for a file.
     */
    public url(filePath: string): string {
        if (!this.urlPrefix) {
            return filePath;
        }

        return `${this.urlPrefix}/${filePath}`;
    }
}
