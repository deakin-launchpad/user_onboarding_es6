import 'dotenv/config';
/*
*Please add project folder name and ibm bucket name here,
* make sure project folder name doesnt not have spaces in between and is same
* as the name you give while running upload_setup.sh
*/

var s3BucketCredentials = {
    "projectFolder": "<app-bucket>",
    "bucket": "<app-bucket>",
    "accessKeyId": process.env.AWS_ACCESS_KEY,
    "secretAccessKey": process.env.AWS_SECRET_KEY,
    "s3URL": "https://app-bucket.s3.ap-southeast-2.amazonaws.com",
    "folder": {
        "profilePicture": "profilePicture",
        "thumb": "thumb",
        "original": "original",
        "image": "image",
        "docs": "docs",
        "files": "files",
        "video": "video",
        "audio": "audio"
    }
};
export default {
    s3BucketCredentials: s3BucketCredentials
};