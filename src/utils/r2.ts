import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    DeleteObjectCommand,
  } from "@aws-sdk/client-s3";
  import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
  
  export interface FileObject {
    Key?: string;
    LastModified?: Date;
    ETag?: string;
    Size?: number;
    StorageClass?: string;
  }
  
  const R2_ACCOUNT_ID = process.env.S3_ACCOUNT_ID!;
  const R2_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID!;
  const R2_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY!;
  const R2_BUCKET = process.env.S3_BUCKET!;
  
  const S3 = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
  
  export async function uploadFile(file: Buffer, key: string) {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: file,
    });
  
    try {
      const response = await S3.send(command);
      return response;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }
  
  export async function getSignedUrlForUpload(
    key: string,
    contentType: string,
    contentLength: number,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
      ContentLength: contentLength,
    });
  
    try {
      // console.log("Generating signed URL for upload...");
      // console.log("Key:", key);
      const signedUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
      console.log("Signed URL generated:", signedUrl);
      return signedUrl;
    } catch (error) {
      console.error("Error generating signed URL:", error);
      throw error;
    }
  }
  
  export async function getSignedUrlForDownload(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    });
  
    try {
      const signedUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
      return signedUrl;
    } catch (error) {
      console.error("Error generating signed URL:", error);
      throw error;
    }
  }
  
  export async function listFiles(prefix= ""): Promise<FileObject[]> {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Prefix: prefix,
    });
  
    try {
      const response = await S3.send(command);
      return response.Contents ?? [];
    } catch (error) {
      console.error("Error listing files:", error);
      throw error;
    }
  }
  
  export async function deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    });
  
    try {
      const response = await S3.send(command);
      return response;
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }