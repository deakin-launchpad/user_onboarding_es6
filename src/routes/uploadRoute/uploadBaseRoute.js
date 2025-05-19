import UniversalFunctions from "../../utils/universalFunctions";
import Joi from "joi";
import Controller from "../../controllers";

const uploadImage = {
  method: 'POST',
  path: '/api/upload/uploadImage',
  handler: async (request, h) => {
    try {
      const payloadData = request.payload;
      const data = await Controller.UploadBaseController.uploadImage(payloadData);
      return UniversalFunctions.sendSuccess(
        UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,
        data
      );
    } catch (error) {
      return UniversalFunctions.sendError(error);
    }
  },
  options: {
    description: 'Upload an image file',
    tags: ['api', 'upload', 'image'],
    payload: {
      maxBytes: 20715200,
      output: 'stream',
      parse: true,
      allow: 'multipart/form-data'
    },
    validate: {
      payload: Joi.object({
        imageFile: Joi.any()
          .meta({ swaggerType: 'file' })
          .required()
          .description('Image file to upload')
      }).label("Upload: Image"),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
};

const uploadVideo = {
  method: 'POST',
  path: '/api/upload/uploadVideo',
  handler: async (request, h) => {
    try {
      const payloadData = request.payload;
      const data = await Controller.UploadBaseController.uploadVideo(payloadData);
      return UniversalFunctions.sendSuccess(
        UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,
        data
      );
    } catch (error) {
      return UniversalFunctions.sendError(error);
    }
  },
  options: {
    description: 'Upload a video file',
    tags: ['api', 'upload', 'video'],
    payload: {
      maxBytes: 207152000,
      output: 'stream',
      parse: true,
      allow: 'multipart/form-data'
    },
    validate: {
      payload: Joi.object({
        videoFile: Joi.any()
          .meta({ swaggerType: 'file' })
          .required()
          .description('Video file to upload')
      }).label("Upload: Video"),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
};

const uploadDocument = {
  method: 'POST',
  path: '/api/upload/uploadDocument',
  handler: async (request, h) => {
    try {
      const payloadData = request.payload;
      const data = await Controller.UploadBaseController.uploadDocument(payloadData);
      return UniversalFunctions.sendSuccess(
        UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,
        data
      );
    } catch (error) {
      return UniversalFunctions.sendError(error);
    }
  },
  options: {
    description: 'Upload a document file',
    tags: ['api', 'upload', 'document'],
    payload: {
      maxBytes: 20715200,
      output: 'stream',
      parse: true,
      allow: 'multipart/form-data'
    },
    validate: {
      payload: Joi.object({
        documentFile: Joi.any()
          .meta({ swaggerType: 'file' })
          .required()
          .description('Document file to upload')
      }).label("Upload: Document"),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
};

export default [
  uploadImage,
  uploadDocument,
  uploadVideo
];
