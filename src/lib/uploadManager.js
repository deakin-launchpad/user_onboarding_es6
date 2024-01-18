/**
* Please use uploadLogger for logging in this file try to abstain from console
* levels of logging:
* - TRACE - ‘blue’
* - DEBUG - ‘cyan’
* - INFO - ‘green’
* - WARN - ‘yellow’
* - ERROR - ‘red’
* - FATAL - ‘magenta’
*/

import async from "async"
import Path from "path";
import fsExtra from "fs-extra";
import fs from "fs";
import AWS from "aws-sdk";
import ffmpeg from "fluent-ffmpeg";
import gm from 'gm';
import CONFIG from "../config/index.js"
import UniversalFunctions from "../utils/universalFunctions.js";
///*
// 1) Save Local Files
// 2) Create Thumbnails
// 3) Upload Files to S3
// 4) Delete Local files
// */
//


const deleteFile = (path, callback) => {

    fs.unlink(path, function (err) {
        console.error("delete", err);
        if (err) {
            var error = {
                response: {
                    message: "Something went wrong",
                    data: {}
                },
                statusCode: 500
            };
            return callback(error);
        } else
            return callback(null);
    });

}
const uploadImageToS3Bucket = (file, isThumb, callback) => {

    var path = file.path, filename = file.name, folder = file.s3Folder, mimeType = file.mimeType;
    if (isThumb) {
        path = path + 'thumb/';
        filename = file.thumbName;
        folder = file.s3FolderThumb;
    }
    //var filename = file.name; // actual filename of file
    //var path = file.path; //will be put into a temp directory
    //var mimeType = file.type;

    var accessKeyId = CONFIG.AWS_S3_CONFIG.s3BucketCredentials.accessKeyId;
    var secretAccessKeyId = CONFIG.AWS_S3_CONFIG.s3BucketCredentials.secretAccessKey;
    //var bucketName = CONFIG.awsS3Config.s3BucketCredentials.bucket;
    //console.log("UPLOAD", file);
    console.log("path to read::" + path + filename);
    fs.readFile(path + filename, function (error, fileBuffer) {
        //  console.log("UPLOAD", file_buffer);
        console.log("path to read from temp::" + path + filename);
        if (error) {
            console.error("UPLOAD", error, fileBuffer);
            var errResp = {
                response: {
                    message: "Something went wrong",
                    data: {}
                },
                statusCode: 500
            };
            return callback(errResp);
        }

        //filename = file.name;
        AWS.config.update({ accessKeyId: accessKeyId, secretAccessKey: secretAccessKeyId });
        var s3bucket = new AWS.S3();
        var params = {
            Bucket: CONFIG.AWS_S3_CONFIG.s3BucketCredentials.bucket,
            Key: folder + '/' + filename,
            Body: fileBuffer,
            ACL: 'public-read',
            ContentType: mimeType
        };

        s3bucket.putObject(params, function (err, data) {
            console.error("PUT", err, data);
            if (err) {
                var error = {
                    response: {
                        message: "Something went wrong",
                        data: {}
                    },
                    statusCode: 500
                };
                return callback(error);
            }
            else {
                console.log(data);
                deleteFile(path + filename, function (err) {
                    console.error(err);
                    if (err)
                        return callback(err);
                    else
                        return callback(null);
                })
            }
        });
    });
};

const initParallelUpload = (fileObj, withThumb, callbackParent) => {

    async.parallel([
        function (callback) {
            console.log("uploading image");
            uploadImageToS3Bucket(fileObj, false, callback);
        },
        function (callback) {
            if (withThumb) {
                console.log("uploading thumbnil");
                uploadImageToS3Bucket(fileObj, true, callback);
            }
            else
                callback(null);
        }
    ], function (error) {
        if (error)
            callbackParent(error);
        else
            callbackParent(null);
    })

}
const saveFile = (fileData, path, callback) => {

    //var path = Path.resolve(".") + "/uploads/" + folderPath + "/" + fileName;

    var file = fs.createWriteStream(path);
    console.log("=========save file======");
    file.on('error', function (err) {

        console.error('@@@@@@@@@@@@@', err);
        var error = {
            response: {
                message: "Some",
                data: {}
            },
            statusCode: 500
        };
        return callback(error);
    });

    fileData.pipe(file);

    fileData.on('end', function (err) {
        if (err) {
            var error = {
                response: {
                    message: "Some",
                    data: {}
                },
                statusCode: 500
            };
            return callback(error);
        } else
            callback(null);
    });


};
const createThumbnailImage = (path, name, callback) => {
    console.log('------first-----');
    var _gm = gm.subClass({ imageMagick: true });
    var thumbPath = path + 'thumb/' + "Thumb_" + name;
    //var tmp_path = path + "-tmpPath"; //will be put into a temp directory

    _gm(path + name)
        .resize(160, 160, "!")
        .autoOrient()
        .write(thumbPath, function (err) {
            console.log('createThumbnailImage');
            console.error(err);

            if (!err) {
                return callback(null);
            } else {
                var error = {
                    response: {
                        message: "Something went wrong",
                        data: {}
                    },
                    statusCode: 500
                };
                console.log('<<<<<<<<<<<<<<<<<', error);
                return callback(error);
            }
        })
};

const getVideoInfo = (filePath, callback) => {
    ffmpeg.ffprobe(filePath, function (err, data) {
        if (err) callback(err)
        else callback(null, data)
    })
}

const createThumbnailVideo = (filePath, name, videoData, callback) => {
    uploadLogger.info('------first-----');
    var thumbPath = filePath + 'thumb/' + 'Thumb_' + name.split('.').slice(0, -1).join('.') + '.jpg';
    var durationInSeconds = videoData.format.duration;
    var frameIntervalInSeconds = Math.floor(durationInSeconds);
    ffmpeg().input(filePath + name).outputOptions([`-vf fps=1/${frameIntervalInSeconds}`]).output(thumbPath).on('end', function () {
        callback()
    }).on('error', function (err) {
        callback(err)
    }).run()
};

const uploadFile = (otherConstants, fileDetails, createThumbnail, callbackParent) => {
    var filename = fileDetails.name;
    var TEMP_FOLDER = otherConstants.TEMP_FOLDER;
    var s3Folder = otherConstants.s3Folder;
    var file = fileDetails.file;
    var mimiType = file.hapi.headers['content-type'];
    async.waterfall([
        function (callback) {
            console.log('TEMP_FOLDER + filename' + TEMP_FOLDER + filename)
            saveFile(file, TEMP_FOLDER + filename, callback);
            console.log("*******save File******", callback)
        },
        function (callback) {
            if (createThumbnail) {
                createThumbnailImage(TEMP_FOLDER, filename, callback);
                console.log("*******thumbnailImage********", callback)
            }

            else
                callback(null);
        },
        function (callback) {
            var fileObj = {
                path: TEMP_FOLDER,
                name: filename,
                thumbName: "Thumb_" + filename,
                mimeType: mimiType,
                s3Folder: s3Folder
            };
            if (createThumbnail)
                fileObj.s3FolderThumb = otherConstants.s3FolderThumb;
            initParallelUpload(fileObj, createThumbnail, callback);
        }
    ], function (error) {
        if (error)
            callbackParent(error);
        else
            callbackParent(null);
    })
};

const uploadVideoFile = (otherConstants, fileDetails, createThumbnail, callbackParent) => {
    var filename = fileDetails.name;
    var TEMP_FOLDER = otherConstants.TEMP_FOLDER;
    var s3Folder = otherConstants.s3Folder;
    var file = fileDetails.file;
    var mimiType = file.hapi.headers['content-type'];
    var videoData;
    async.waterfall([
        function (callback) {
            uploadLogger.info('TEMP_FOLDER + filename' + TEMP_FOLDER + filename)
            saveFile(file, TEMP_FOLDER + filename, callback);
            uploadLogger.info("*******save File******", callback)
        },
        function (callback) {
            getVideoInfo(TEMP_FOLDER + filename, function (err, data) {
                if (err) callback(err)
                else {
                    videoData = data;
                    callback()
                }
            })
        },
        function (callback) {
            if (createThumbnail) {
                createThumbnailVideo(TEMP_FOLDER, filename, videoData, callback);
            }

            else
                callback(null);
        },
        function (callback) {
            var fileObj = {
                path: TEMP_FOLDER,
                name: filename,
                thumbName: "Thumb_" + filename.split('.').slice(0, -1).join('.') + '.jpg',
                mimeType: mimiType,
                s3Folder: s3Folder
            };
            if (createThumbnail)
                fileObj.s3FolderThumb = otherConstants.s3FolderThumb;
            initParallelUpload(fileObj, createThumbnail, callback);
        }
    ], function (error) {
        if (error)
            callbackParent(error);
        else
            callbackParent(null, { videoData: videoData });
    })
};

const uploadProfilePicture = (profilePicture, folder, filename, callbackParent) => {
    var baseFolder = folder + '/' + CONFIG.AWS_S3_CONFIG.s3BucketCredentials.folder.profilePicture;
    var baseURL = CONFIG.AWS_S3_CONFIG.s3BucketCredentials.s3URL + '/' + baseFolder + '/';
    var urls = {};
    async.waterfall([
        function (callback) {
            var profileFolder = CONFIG.AWS_S3_CONFIG.s3BucketCredentials.folder.original;
            var profileFolderThumb = CONFIG.AWS_S3_CONFIG.s3BucketCredentials.folder.thumb;
            var profilePictureName = UniversalFunctions.generateFilenameWithExtension(profilePicture.hapi.filename, "Profile_" + filename);
            var s3Folder = baseFolder + '/' + profileFolder;
            var s3FolderThumb = baseFolder + '/' + profileFolderThumb;
            var profileFolderUploadPath = CONFIG.AWS_S3_CONFIG.s3BucketCredentials.projectFolder + "/profilePicture";
            var path = Path.resolve("..") + "/uploads/" + profileFolderUploadPath + "/";
            var fileDetails = {
                file: profilePicture,
                name: profilePictureName
            };
            var otherConstants = {
                TEMP_FOLDER: path,
                s3Folder: s3Folder,
                s3FolderThumb: s3FolderThumb
            };
            urls.profilePicture = baseURL + profileFolder + '/' + profilePictureName;
            urls.profilePictureThumb = baseURL + profileFolderThumb + '/Thumb_' + profilePictureName;
            uploadFile(otherConstants, fileDetails, true, callback);
        }
    ],

        function (error) {
            if (error) {
                console.log("upload image error :: ", error);
                callbackParent(error);
            }
            else {
                console.log("upload image result :", urls);


                console.log('hello');
                console.log(urls);
                callbackParent(null, urls);
            }
        })
}

const uploadfileWithoutThumbnail = (docFile, folder, filename, callbackParent) => {
    var baseFolder = folder + '/' + CONFIG.AWS_S3_CONFIG.s3BucketCredentials.folder.docs;
    var baseURL = CONFIG.AWS_S3_CONFIG.s3BucketCredentials.s3URL + '/' + baseFolder + '/';
    var urls = {};
    async.waterfall([
        function (callback) {
            var docFileFolder = CONFIG.AWS_S3_CONFIG.s3BucketCredentials.folder.original;
            var docFileName = UniversalFunctions.generateFilenameWithExtension(docFile.hapi.filename, "Docs_" + filename);
            var s3Folder = baseFolder + '/' + docFileFolder;
            var docFolderUploadPath = CONFIG.AWS_S3_CONFIG.s3BucketCredentials.projectFolder + "/docs";
            var path = Path.resolve("..") + "/uploads/" + docFolderUploadPath + "/";
            var fileDetails = {
                file: docFile,
                name: docFileName
            };
            var otherConstants = {
                TEMP_FOLDER: path,
                s3Folder: s3Folder
            };
            urls.docFile = baseURL + docFileFolder + '/' + docFileName;
            uploadFile(otherConstants, fileDetails, false, callback);
        }
    ],

        function (error) {
            if (error) {
                console.log("upload image error :: ", error);
                callbackParent(error);
            }
            else {
                console.log("upload image result :", urls);


                console.log('hello');
                console.log(urls);
                callbackParent(null, urls);
            }
        })
}

const uploadVideoWithThumbnail = (videoFile, folder, filename, callbackParent) => {
    var baseFolder = folder + '/' + CONFIG.AWS_S3_CONFIG.s3BucketCredentials.folder.video;
    var baseURL = CONFIG.AWS_S3_CONFIG.s3BucketCredentials.s3URL + '/' + baseFolder + '/';
    var urls = {};
    var fileDetails, otherConstants;
    async.waterfall([
        function (callback) {
            var videoFileFolder = CONFIG.AWS_S3_CONFIG.s3BucketCredentials.folder.original;
            var videoFolderThumb = CONFIG.AWS_S3_CONFIG.s3BucketCredentials.folder.thumb;
            var videoFileName = UniversalFunctions.generateFilenameWithExtension(videoFile.hapi.filename, "Video_" + filename);
            var s3Folder = baseFolder + '/' + videoFileFolder;
            var s3FolderThumb = baseFolder + '/' + videoFolderThumb;
            var videoFolderUploadPath = CONFIG.AWS_S3_CONFIG.s3BucketCredentials.projectFolder + "/video";
            var path = Path.resolve("..") + "/uploads/" + videoFolderUploadPath + "/";
            fileDetails = {
                file: videoFile,
                name: videoFileName
            };
            otherConstants = {
                TEMP_FOLDER: path,
                s3Folder: s3Folder,
                s3FolderThumb: s3FolderThumb
            };
            urls.videoFile = baseURL + videoFileFolder + '/' + videoFileName;
            urls.videoFileThumb = baseURL + videoFolderThumb + '/Thumb_' + videoFileName.split('.').slice(0, -1).join('.') + '.jpg';
            uploadVideoFile(otherConstants, fileDetails, true, function (err, data) {
                if (err) callback(err)
                else {
                    urls.videoInfo = data.videoData;
                    callback()
                }
            });
        }
    ],

        function (error) {
            if (error) {
                uploadLogger.error("upload image error :: ", error);
                callbackParent(error);
            }
            else {
                uploadLogger.info("upload image result :", urls);
                callbackParent(null, urls);
            }
        })
}

const saveCSVFile = (fileData, path, callback) => {
    fsExtra.copy(fileData, path, callback);
}

export default {
    deleteFile: deleteFile,
    initParallelUpload: initParallelUpload,
    saveFile: saveFile,
    createThumbnailImage: createThumbnailImage,
    getVideoInfo: getVideoInfo,
    createThumbnailVideo: createThumbnailVideo,
    uploadFile: uploadFile,
    uploadVideoFile: uploadVideoFile,
    uploadProfilePicture: uploadProfilePicture,
    uploadfileWithoutThumbnail: uploadfileWithoutThumbnail,
    uploadVideoWithThumbnail: uploadVideoWithThumbnail,
    saveCSVFile: saveCSVFile,
};