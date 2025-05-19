import 'dotenv/config';
/*
*Please add project folder name and ibm bucket name here,
* make sure project folder name doesnt not have spaces in between and is same
* as the name you give while running upload_setup.sh
*/

const s3Config = {
    region: process.env.AWS_REGION || 'ap-southeast-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
};

const bucketConfig = {
    bucketName: process.env.S3_BUCKET_NAME || '<app-bucket>',
    baseUrl: `https://${process.env.S3_BUCKET_NAME || '<app-bucket>'}.s3.${process.env.AWS_REGION || 'ap-southeast-2'}.amazonaws.com`,
    folders: {
        profilePicture: 'profilePicture',
        thumb: 'thumb',
        original: 'original',
        image: 'image',
        docs: 'docs',
        files: 'files',
        video: 'video',
        audio: 'audio'
    }
};

export default {
    s3Config,
    bucketConfig
};