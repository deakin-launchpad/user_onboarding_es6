import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from 'stream';
import awsConfig from '../config/awsS3Config';

class S3Service {
  constructor() {
    this.s3Client = new S3Client(awsConfig.s3Config);
    this.bucketName = awsConfig.bucketConfig.bucketName;
    this.baseUrl = awsConfig.bucketConfig.baseUrl;
  }

  /**
   * Upload a file to S3
   * @param {Buffer|Readable} fileBuffer - The file buffer or stream to upload
   * @param {string} key - The S3 key (path) where the file will be stored
   * @param {string} contentType - The content type of the file
   * @returns {Promise<string>} The URL of the uploaded file
   */
  async uploadFile(fileBuffer, key, contentType) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType
    });

    try {
      await this.s3Client.send(command);
      return `${this.baseUrl}/${key}`;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  }

  /**
   * Get a file from S3
   * @param {string} key - The S3 key (path) of the file
   * @returns {Promise<Readable>} The file stream
   */
  async getFile(key) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key
    });

    try {
      const response = await this.s3Client.send(command);
      return response.Body;
    } catch (error) {
      console.error('Error getting file from S3:', error);
      throw error;
    }
  }

  /**
   * Delete a file from S3
   * @param {string} key - The S3 key (path) of the file to delete
   * @returns {Promise<void>}
   */
  async deleteFile(key) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw error;
    }
  }

  /**
   * List files in a directory
   * @param {string} prefix - The directory prefix to list
   * @returns {Promise<Array>} Array of file objects
   */
  async listFiles(prefix) {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: prefix
    });

    try {
      const response = await this.s3Client.send(command);
      return response.Contents || [];
    } catch (error) {
      console.error('Error listing files from S3:', error);
      throw error;
    }
  }

  /**
   * Check if a file exists in S3
   * @param {string} key - The S3 key (path) to check
   * @returns {Promise<boolean>} Whether the file exists
   */
  async fileExists(key) {
    const command = new HeadObjectCommand({
      Bucket: this.bucketName,
      Key: key
    });

    try {
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Generate a pre-signed URL for temporary access
   * @param {string} key - The S3 key (path) of the file
   * @param {number} expiresIn - URL expiration time in seconds
   * @returns {Promise<string>} The pre-signed URL
   */
  async getSignedUrl(key, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key
    });

    try {
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw error;
    }
  }

  /**
   * Get the full URL for a file
   * @param {string} key - The S3 key (path) of the file
   * @returns {string} The full URL
   */
  getFileUrl(key) {
    return `${this.baseUrl}/${key}`;
  }
}

export default new S3Service(); 