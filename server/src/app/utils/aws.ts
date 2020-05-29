import * as AWS from "aws-sdk";
import * as fs from "fs";
import configs from "@configs";

const config = {
  accessKeyId: configs.aws_bucket.access_key,
  secretAccessKey: configs.aws_bucket.secret_access_key,
  region: configs.aws_bucket.bucket_region,
  endpoint: configs.aws_bucket.bucket_endpoint
};
const bucket = configs.aws_bucket.bucket_name;
const s3 = new AWS.S3(config);

export const uploadFile = ({ fileName, filePath, fileType }): Promise<any> =>
  new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath);
    s3.upload({
      Bucket: bucket,
      Body: fileContent,
      Key: fileName,
      ContentType: fileType,
    }, function (err, data) {
      if (err) {
        console.log(err);
        reject(err);
      } else if (data) {
        resolve({
          key: data.key,
          url: data.Location
        });
      }
    });
  });
