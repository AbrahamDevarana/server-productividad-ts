import tinify from 'tinify';
import { S3Client } from '@aws-sdk/client-s3';
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


const uploadFiles = async (files: any, folder: string, cropW:number = 500, cropH?:number ): Promise<any[]> => {

    let galeria: any = [];

   
    return new Promise( async (resolve, reject) => {
        await Promise.all(files.map(async (file: any) => {


                let bufferedFile: any = file.filepath
            
                if(file.mimetype.includes('image')){
                    const tinified = tinify.fromFile(file.filepath);
                    // crop
                    const croppedAndTinified = tinified.resize({
                        method: "scale",
                        width: cropW,
                        height: cropH
                    });

                    bufferedFile = await croppedAndTinified.toBuffer();
                }else{
                    bufferedFile = fs.readFileSync(file.filepath);
                }

                const folderDest = `${process.env.AWS_STORAGE_FOLDER}/${folder}`;

                const params = {
                    Bucket: process.env.AWS_BUCKET_NAME || '',
                    Key: `${folderDest}/${Date.now()}-${file.originalFilename}`,
                    Body: bufferedFile,
                    ACL: 'public-read',
                    ContentType: file.mimetype,
                };

                const data = await s3Client.send(new PutObjectCommand(params));
                
                if(data.$metadata.httpStatusCode === 200){
                    galeria.push({
                        name: file.originalFilename,
                        url: params.Key
                    });
                }else{
                    reject('Error al subir el archivo');
                }
            
        })).catch(err => {
            reject(err);
        });

        resolve(galeria);
    });
}


const deleteFile = async (files: any[]): Promise<boolean> => {

    return new Promise( async (resolve, reject) => {
        await Promise.all(files.map(async (item) => {
            const deleteParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: item
            }
            const data = await s3Client.send(new DeleteObjectCommand(deleteParams))
            if(data) {
                console.log('deleted');
            }else{
                reject('error')
            }
        })).catch( (err) => {
            console.log(err);
            reject(err)
        })
        resolve(true);
    })
}

export {
    uploadFiles,
    deleteFile
};

