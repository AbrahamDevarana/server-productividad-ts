import tinify from 'tinify';
import { PutObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
import fs from 'fs';
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3')
tinify.key = process.env.TINY_IMG_API_KEY || '';


// S3 Server
const s3Client = new S3Client ({
    forcePathStyle: false,
    endpoint: process.env.AWS_ENDPOINT,
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
});



interface SingleFileProps {
    files: any;
    folder: string;
    cropW?: number;
    cropH?: number;
    crop?: boolean;
}

const uploadFiles = async (files: any, folder: string, cropW: number = 500, cropH?: number): Promise<any[]> => {
    const galeria: any[] = [];
  
    await Promise.all(
      files.map(async (file: any) => {
        let bufferedFile: any = file.filepath;
  
        if (file.mimetype.includes('image')) {
          const tinified = tinify.fromFile(file.filepath);
          // crop
          // const croppedAndTinified = tinified.resize({
          //   method: 'scale',
          //   width: cropW,
          //   height: cropH,
          // });
  
          bufferedFile = await tinified.toBuffer();
        } else {
          bufferedFile = await fs.promises.readFile(file.filepath);
        }
  
        const folderDest = `${process.env.AWS_STORAGE_FOLDER}/${folder}`;

        const fileName = `${Date.now()}-${file.originalFilename}`;
  
        const params = {
          Bucket: process.env.AWS_BUCKET_NAME || '',
          Key: `${folderDest}/${fileName}`,
          Body: bufferedFile,
          ACL: 'public-read',
          ContentType: file.mimetype,
        };
  
        const data = await s3Client.send(new PutObjectCommand(params));
  
        if (data.$metadata.httpStatusCode === 200) {
          galeria.push({
            name: file.originalFilename,
            url: fileName
          });
        } else {
          throw new Error('Error al subir el archivo');
        }
      })
    );
  
    return galeria;
};




const deleteFile = async (files: any[]): Promise<boolean> => {
    try {
        await Promise.all(files.map(async (item) => {
            const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: item
            };
            await s3Client.send(new DeleteObjectCommand(deleteParams));
            console.log('deleted');
        }));
        return true;
    } catch (err) {
        console.log('error al eliminar');
        console.error(err);
      throw err;
    }
};

const uploadFile = async ({ files, folder}: SingleFileProps): Promise<{ name: string; url: string }[]> => {
    const galeria: { name: string; url: string }[] = [];

    const elements = Array.isArray(files) ? files : [files];  

    await Promise.all(
        elements.map( async (file: any) => { 
            let bufferedFile: any = file.filepath;
            if (file.mimetype.includes('image')) {
                const tinified = tinify.fromFile(file.filepath);
				bufferedFile = await tinified.toBuffer();
            }
            else {
                bufferedFile = await fs.promises.readFile(file.filepath);
            }
            const folderDest = `${process.env.AWS_STORAGE_FOLDER}/${folder}`;
            const fileName = `${Date.now()}-${file.originalFilename}`;
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME || '',
                Key: `${folderDest}/${fileName}`,
                Body: bufferedFile,
                ACL: 'public-read',
                ContentType: file.mimetype,
            }

            const data: PutObjectCommandOutput = await s3Client.send(new PutObjectCommand(params));
            if (data.$metadata.httpStatusCode === 200) {
                galeria.push({
                    name: file.originalFilename,
                    url: folder + '/' + fileName
                });
            }
            else {
                throw new Error('Error al subir el archivo');
            }
        })
    );
    return galeria;
};

export {
    uploadFiles,
    uploadFile,
    deleteFile
};

