import * as AWS from "aws-sdk";
import * as fs from "fs";

const config = {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_BUCKET_REGION,
  endpoint: process.env.AWS_BUCKET_ENDPOINT,
};
const bucket = process.env.AWS_BUCKET_NAME;
const s3 = new AWS.S3(config);

export const uploadFile = ({ fileName, filePath, fileType }): Promise<any> =>
  new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath);
    s3.upload({
      Bucket: bucket,
      Body: fileContent,
      Key: fileName,
      ContentType: fileType,
    }, (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      } else if (data) {
        resolve({
          key: data.key,
          url: data.Location
        });
      }
    });
  });

export const deleteFile = (filePath): Promise<any> =>
  new Promise((resolve, reject) => {
    s3.deleteObject({
      Bucket: bucket,
      Key: getKeyFromPath(filePath)
    }, (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve({
          success: true
        });
      }
    });
  });

export const getKeyFromPath = filePath => {
  const pattern = "amazonaws.com/";
  const key = filePath.substring(filePath.indexOf(pattern) + pattern.length);
  return key;
};