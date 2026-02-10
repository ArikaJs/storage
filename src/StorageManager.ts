import { Disk } from './Disk';
import { Filesystem } from './Contracts/Filesystem';
import { LocalDriver } from './Drivers/LocalDriver';
import { S3Driver } from './Drivers/S3Driver';

export class StorageManager {
    private disks: Map<string, Disk> = new Map();
    private config: any;

    constructor(config: any) {
        this.config = config;
    }

    /**
     * Get a disk instance.
     */
    public disk(name?: string): Disk {
        name = name || this.config.default;

        if (!name) {
            throw new Error('No default disk configured.');
        }

        if (!this.disks.has(name)) {
            this.disks.set(name, this.resolveDisk(name));
        }

        return this.disks.get(name)!;
    }

    /**
     * Resolve a disk from configuration.
     */
    private resolveDisk(name: string): Disk {
        const diskConfig = this.config.disks[name];

        if (!diskConfig) {
            throw new Error(`Disk [${name}] is not configured.`);
        }

        const driver = this.createDriver(diskConfig);
        return new Disk(driver);
    }

    /**
     * Create a driver instance based on configuration.
     */
    private createDriver(config: any): Filesystem {
        switch (config.driver) {
            case 'local':
                return new LocalDriver(config);
            case 's3':
                return new S3Driver(config);
            default:
                throw new Error(`Driver [${config.driver}] is not supported.`);
        }
    }

    /**
     * Proxy methods to the default disk.
     */
    public async put(path: string, contents: string | Buffer): Promise<void> {
        return await this.disk().put(path, contents);
    }

    public async get(path: string): Promise<Buffer> {
        return await this.disk().get(path);
    }

    public async exists(path: string): Promise<boolean> {
        return await this.disk().exists(path);
    }

    public async delete(path: string): Promise<void> {
        return await this.disk().delete(path);
    }

    public url(path: string): string {
        return this.disk().url(path);
    }
}
