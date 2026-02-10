import { Filesystem } from '../Contracts/Filesystem';
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
    S3ClientConfig
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

export class S3Driver implements Filesystem {
    protected client: S3Client;
    protected bucket: string;
    protected region: string;
    protected urlEndpoint?: string;

    constructor(config: {
        key: string;
        secret: string;
        region: string;
        bucket: string;
        endpoint?: string;
        url?: string;
        forcePathStyle?: boolean;
    }) {
        const s3Config: S3ClientConfig = {
            region: config.region,
            credentials: {
                accessKeyId: config.key,
                secretAccessKey: config.secret,
            },
            endpoint: config.endpoint,
            forcePathStyle: config.forcePathStyle,
        };

        this.client = new S3Client(s3Config);
        this.bucket = config.bucket;
        this.region = config.region;
        this.urlEndpoint = config.url;
    }

    /**
     * Write contents to a file.
     */
    async put(path: string, contents: string | Buffer): Promise<void> {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: path,
            Body: contents,
        });

        await this.client.send(command);
    }

    /**
     * Read file contents.
     */
    async get(path: string): Promise<Buffer> {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: path,
        });

        const response = await this.client.send(command);

        if (!response.Body) {
            throw new Error(`File not found: ${path}`);
        }

        // Convert stream to buffer
        return this.streamToBuffer(response.Body as Readable);
    }

    /**
     * Check if a file exists.
     */
    async exists(path: string): Promise<boolean> {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucket,
                Key: path,
            });

            await this.client.send(command);
            return true;
        } catch (error: any) {
            if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
                return false;
            }
            throw error;
        }
    }

    /**
     * Delete a file.
     */
    async delete(path: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: path,
        });

        await this.client.send(command);
    }

    /**
     * Get the URL for a file.
     */
    url(path: string): string {
        if (this.urlEndpoint) {
            return `${this.urlEndpoint}/${path}`;
        }
        return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${path}`;
    }

    /**
     * Helper to convert stream to buffer.
     */
    private async streamToBuffer(stream: Readable): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const chunks: any[] = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks)));
        });
    }
}
