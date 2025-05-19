import UniversalFunctions from "../../utils/universalFunctions";
import UploadManager from "../../lib/uploadManager";
import CONFIG from "../../config";

const ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;

/**
 * Upload an image file
 * @param {Object} payloadData - The request payload containing the image file
 * @returns {Promise<Object>} Object containing the uploaded image URLs
 */
const uploadImage = async (payloadData) => {
  const { imageFile } = payloadData;
  let imageFileURL = null;

  if (imageFile?.hapi?.filename) {
    appLogger.info("File extension:", UniversalFunctions.checkFileExtension(imageFile.hapi.filename));

    try {
      const uploadedInfo = await UploadManager.uploadProfilePicture(
        imageFile,
        CONFIG.AWS_S3_CONFIG.s3BucketCredentials.folder.image,
        UniversalFunctions.generateRandomString()
      );

      imageFileURL = {
        original: uploadedInfo.profilePicture,
        thumbnail: uploadedInfo.profilePictureThumb
      };
    } catch (error) {
      appLogger.error("Error uploading image:", error);
      throw error;
    }
  }

  return { imageFileURL };
};

/**
 * Upload a video file
 * @param {Object} payloadData - The request payload containing the video file
 * @returns {Promise<Object>} Object containing the uploaded video URLs and info
 */
const uploadVideo = async (payloadData) => {
  const { videoFile } = payloadData;
  let videoFileURL = null;

  if (videoFile?.hapi?.filename) {
    appLogger.info("File extension:", UniversalFunctions.checkFileExtension(videoFile.hapi.filename));

    try {
      const uploadedInfo = await UploadManager.uploadVideoWithThumbnail(
        videoFile,
        CONFIG.AWS_S3_CONFIG.s3BucketCredentials.folder.video,
        UniversalFunctions.generateRandomString()
      );

      videoFileURL = {
        original: uploadedInfo.videoFile,
        thumbnail: uploadedInfo.videoFileThumb,
        videoInfo: uploadedInfo.videoInfo
      };
    } catch (error) {
      appLogger.error("Error uploading video:", error);
      throw error;
    }
  }

  return { videoFileURL };
};

/**
 * Upload a document file
 * @param {Object} payloadData - The request payload containing the document file
 * @returns {Promise<Object>} Object containing the uploaded document URL
 */
const uploadDocument = async (payloadData) => {
  const { documentFile } = payloadData;
  let documentFileUrl = null;

  if (documentFile?.hapi?.filename) {
    try {
      const uploadedInfo = await UploadManager.uploadfileWithoutThumbnail(
        documentFile,
        CONFIG.AWS_S3_CONFIG.s3BucketCredentials.folder.files,
        UniversalFunctions.generateRandomString()
      );

      documentFileUrl = {
        original: uploadedInfo.docFile
      };
    } catch (error) {
      appLogger.error("Error uploading document:", error);
      throw error;
    }
  }

  return { documentFileUrl };
};

export default {
  uploadImage,
  uploadDocument,
  uploadVideo
};