import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({region: 'us-east-1'});

export const uploadUrl = async (event) => {
  try {
    const bucketName = process.env.BUCKET_NAME;

    const {fileName, fileType} = JSON.parse(event.body)

    if(!fileName || !fileType){
      return {
        statusCode: 400,
        body: JSON.stringify({msg: 'fileName and fileType are required'})
      }
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      ContentType: fileType,
    });

    //generate a pre-signed url to allows the client to upload file directly to s3
    const signedUrl = await getSignedUrl(s3Client, command, {expiresIn: 3600});

    //client uses this url to perform the file upload

    return {
      statusCode: 200,
      body: JSON.stringify({uploadUrl: signedUrl})
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({error: error.message})
    }

  }
}