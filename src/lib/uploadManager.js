/**
* Please use appLogger for logging in this file try to abstain from console
* levels of logging:
* - TRACE - 'blue'
* - DEBUG - 'cyan'
* - INFO - 'green'
* - WARN - 'yellow'
* - ERROR - 'red'
* - FATAL - 'magenta'
*/

import CONFIG from "../config"
import UniversalFunctions from "../utils/universalFunctions";
import Path from "path";
import fsExtra from "fs-extra";
import sharp from 'sharp';
import fs from "fs/promises";
import ffmpeg from "fluent-ffmpeg";
import { promisify } from 'util';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import s3Service from "./s3Service";
///*
// 1) Save Local Files
// 2) Create Thumbnails
// 3) Upload Files to S3
// 4) Delete Local files
// */
//

const getVideoInfo = promisify(ffmpeg.ffprobe);

const deleteFile = async (path) => {
    try {
        await fs.unlink(path);
    } catch (error) {
        appLogger.error('Error deleting file:', error);
        throw {
            response: {
                message: "Failed to delete file",
                data: {}
            },
            statusCode: 500
        };
    }
};

const uploadImageToS3Bucket = async (file, isThumb) => {
    const { path, name, s3Folder, mimeType } = file;
    const filePath = isThumb ? `${path}thumb/` : path;
    const fileName = isThumb ? file.thumbName : name;
    const folder = isThumb ? file.s3FolderThumb : s3Folder;

    try {
        const fileBuffer = await fs.readFile(`${filePath}${fileName}`);
        const key = `${folder}/${fileName}`;

        await s3Service.uploadFile(fileBuffer, key, mimeType);
        await deleteFile(`${filePath}${fileName}`);
    } catch (error) {
        appLogger.error('Error uploading to S3:', error);
        throw {
            response: {
                message: "Failed to upload file to S3",
                data: {}
            },
            statusCode: 500
        };
    }
};

const initParallelUpload = async (fileObj, withThumb) => {
    try {
        await uploadImageToS3Bucket(fileObj, false);
        if (withThumb) {
            await uploadImageToS3Bucket(fileObj, true);
        }
    } catch (error) {
        appLogger.error('Error in parallel upload:', error);
        throw error;
    }
};

const saveFile = async (fileData, path) => {
    try {
        const writeStream = createWriteStream(path);
        await pipeline(fileData, writeStream);
    } catch (error) {
        appLogger.error('Error saving file:', error);
        throw {
            response: {
                message: "Failed to save file",
                data: {}
            },
            statusCode: 500
        };
    }
};

const createThumbnailImage = async (path, name) => {
    const thumbPath = `${path}thumb/Thumb_${name}`;

    try {
        await sharp(path)
            .resize(160, 160, {
                fit: 'fill'
            })
            .rotate() // auto-orient
            .toFile(thumbPath);
    } catch (error) {
        appLogger.error('Error creating thumbnail:', error);
        throw {
            response: {
                message: "Failed to create thumbnail",
                data: {}
            },
            statusCode: 500
        };
    }
};

const createThumbnailVideo = async (filePath, name, videoData) => {
    const thumbPath = `${filePath}thumb/Thumb_${name.split('.').slice(0, -1).join('.')}.jpg`;
    const durationInSeconds = videoData.format.duration;
    const frameIntervalInSeconds = Math.floor(durationInSeconds);

    try {
        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(`${filePath}${name}`)
                .outputOptions([`-vf fps=1/${frameIntervalInSeconds}`])
                .output(thumbPath)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });
    } catch (error) {
        appLogger.error('Error creating video thumbnail:', error);
        throw error;
    }
};

const uploadFile = async (otherConstants, fileDetails, createThumbnail) => {
    const { filename, file } = fileDetails;
    const { TEMP_FOLDER, s3Folder, s3FolderThumb } = otherConstants;
    const mimeType = file.hapi.headers['content-type'];

    try {
        await saveFile(file, `${TEMP_FOLDER}${filename}`);

        if (createThumbnail) {
            await createThumbnailImage(TEMP_FOLDER, filename);
        }

        const fileObj = {
            path: TEMP_FOLDER,
            name: filename,
            thumbName: `Thumb_${filename}`,
            mimeType,
            s3Folder,
            s3FolderThumb: createThumbnail ? s3FolderThumb : undefined
        };

        await initParallelUpload(fileObj, createThumbnail);
    } catch (error) {
        appLogger.error('Error in file upload:', error);
        throw error;
    }
};

const uploadVideoFile = async (otherConstants, fileDetails, createThumbnail) => {
    const { filename, file } = fileDetails;
    const { TEMP_FOLDER, s3Folder, s3FolderThumb } = otherConstants;
    const mimeType = file.hapi.headers['content-type'];

    try {
        await saveFile(file, `${TEMP_FOLDER}${filename}`);

        const videoData = await getVideoInfo(`${TEMP_FOLDER}${filename}`);

        if (createThumbnail) {
            await createThumbnailVideo(TEMP_FOLDER, filename, videoData);
        }

        const fileObj = {
            path: TEMP_FOLDER,
            name: filename,
            thumbName: `Thumb_${filename.split('.').slice(0, -1).join('.')}.jpg`,
            mimeType,
            s3Folder,
            s3FolderThumb: createThumbnail ? s3FolderThumb : undefined
        };

        await initParallelUpload(fileObj, createThumbnail);
        return { videoData };
    } catch (error) {
        appLogger.error('Error in video upload:', error);
        throw error;
    }
};

const uploadProfilePicture = async (profilePicture, folder, filename) => {
    const baseFolder = `${folder}/${CONFIG.AWS_S3_CONFIG.s3BucketCredentials.folder.profilePicture}`;
    const baseURL = `${CONFIG.AWS_S3_CONFIG.s3BucketCredentials.s3URL}/${baseFolder}/`;
    const urls = {};

    try {
        const profileFolder = CONFIG.AWS_S3_CONFIG.s3BucketCredentials.folder.original;
        const profileFolderThumb = CONFIG.AWS_S3_CONFIG.s3BucketCredentials.folder.thumb;
        const profilePictureName = UniversalFunctions.generateFilenameWithExtension(
            profilePicture.hapi.filename,
            `Profile_${filename}`
        );
        const s3Folder = `${baseFolder}/${profileFolder}`;
        const s3FolderThumb = `${baseFolder}/${profileFolderThumb}`;
        const profileFolderUploadPath = `${CONFIG.AWS_S3_CONFIG.s3BucketCredentials.projectFolder}/profilePicture`;
        const path = `${Path.resolve("..")}/uploads/${profileFolderUploadPath}/`;

        const fileDetails = {
            file: profilePicture,
            name: profilePictureName
        };

        const otherConstants = {
            TEMP_FOLDER: path,
            s3Folder,
            s3FolderThumb
        };

        urls.profilePicture = `${baseURL}${profileFolder}/${profilePictureName}`;
        urls.profilePictureThumb = `${baseURL}${profileFolderThumb}/Thumb_${profilePictureName}`;

        await uploadFile(otherConstants, fileDetails, true);
        return urls;
    } catch (error) {
        appLogger.error('Error uploading profile picture:', error);
        throw error;
    }
};

const uploadfileWithoutThumbnail = async (docFile, folder, filename) => {
    const baseFolder = `${folder}/${CONFIG.AWS_S3_CONFIG.s3BucketCredentials.folder.docs}`;
    const baseURL = `${CONFIG.AWS_S3_CONFIG.s3BucketCredentials.s3URL}/${baseFolder}/`;
    const urls = {};

    try {
        const docFileFolder = CONFIG.AWS_S3_CONFIG.s3BucketCredentials.folder.original;
        const docFileName = UniversalFunctions.generateFilenameWithExtension(
            docFile.hapi.filename,
            `Docs_${filename}`
        );
        const s3Folder = `${baseFolder}/${docFileFolder}`;
        const docFolderUploadPath = `${CONFIG.AWS_S3_CONFIG.s3BucketCredentials.projectFolder}/docs`;
        const path = `${Path.resolve("..")}/uploads/${docFolderUploadPath}/`;

        const fileDetails = {
            file: docFile,
            name: docFileName
        };

        const otherConstants = {
            TEMP_FOLDER: path,
            s3Folder
        };

        urls.docFile = `${baseURL}${docFileFolder}/${docFileName}`;
        await uploadFile(otherConstants, fileDetails, false);
        return urls;
    } catch (error) {
        appLogger.error('Error uploading file without thumbnail:', error);
        throw error;
    }
};

const uploadVideoWithThumbnail = async (videoFile, folder, filename) => {
    const baseFolder = `${folder}/${CONFIG.AWS_S3_CONFIG.s3BucketCredentials.folder.video}`;
    const baseURL = `${CONFIG.AWS_S3_CONFIG.s3BucketCredentials.s3URL}/${baseFolder}/`;
    const urls = {};

    try {
        const videoFileFolder = CONFIG.AWS_S3_CONFIG.s3BucketCredentials.folder.original;
        const videoFolderThumb = CONFIG.AWS_S3_CONFIG.s3BucketCredentials.folder.thumb;
        const videoFileName = UniversalFunctions.generateFilenameWithExtension(
            videoFile.hapi.filename,
            `Video_${filename}`
        );
        const s3Folder = `${baseFolder}/${videoFileFolder}`;
        const s3FolderThumb = `${baseFolder}/${videoFolderThumb}`;
        const videoFolderUploadPath = `${CONFIG.AWS_S3_CONFIG.s3BucketCredentials.projectFolder}/video`;
        const path = `${Path.resolve("..")}/uploads/${videoFolderUploadPath}/`;

        const fileDetails = {
            file: videoFile,
            name: videoFileName
        };

        const otherConstants = {
            TEMP_FOLDER: path,
            s3Folder,
            s3FolderThumb
        };

        urls.videoFile = `${baseURL}${videoFileFolder}/${videoFileName}`;
        urls.videoFileThumb = `${baseURL}${videoFolderThumb}/Thumb_${videoFileName.split('.').slice(0, -1).join('.')}.jpg`;

        const { videoData } = await uploadVideoFile(otherConstants, fileDetails, true);
        urls.videoInfo = videoData;
        return urls;
    } catch (error) {
        appLogger.error('Error uploading video with thumbnail:', error);
        throw error;
    }
};

const saveCSVFile = async (fileData, path) => {
    try {
        await fsExtra.copy(fileData, path);
    } catch (error) {
        appLogger.error('Error saving CSV file:', error);
        throw error;
    }
};

export default {
    deleteFile,
    initParallelUpload,
    saveFile,
    createThumbnailImage,
    getVideoInfo,
    createThumbnailVideo,
    uploadFile,
    uploadVideoFile,
    uploadProfilePicture,
    uploadfileWithoutThumbnail,
    uploadVideoWithThumbnail,
    saveCSVFile
};