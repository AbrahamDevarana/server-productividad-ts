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


const deleteFile = async (files: any[]): Promise<boolean> => {
    try {
        await Promise.all(files.map(async (item) => {

            console.log(item);
            
            const deleteParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                
                Key: process.env.AWS_STORAGE_FOLDER + '/' + item,
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

// const uploadFile = async ({ files, folder}: SingleFileProps): Promise<{ name: string; url: string }[]> => {
//     const galeria: { name: string; url: string }[] = [];

//     const elements = Array.isArray(files) ? files : [files];  

//     await Promise.allSettled(
//         elements.map( async (file: any) => { 
//             let bufferedFile: any = file.filepath;
//             if (file.mimetype.includes('image')) {
//                 const tinified = tinify.fromFile(file.filepath);
// 				        bufferedFile = await tinified.toBuffer();
//             }
//             else {
//                 bufferedFile = await fs.promises.readFile(file.filepath);
//             }
//             const folderDest = `${process.env.AWS_STORAGE_FOLDER}/${folder}`;
//             const fileName = `${Date.now()}-${file.originalFilename}`;
//             const params = {
//                 Bucket: process.env.AWS_BUCKET_NAME || '',
//                 Key: `${folderDest}/${fileName}`,
//                 Body: bufferedFile,
//                 ACL: 'public-read',
//                 ContentType: file.mimetype,
//             }

//             const data: PutObjectCommandOutput = await s3Client.send(new PutObjectCommand(params));
//             if (data.$metadata.httpStatusCode === 200) {
//                 galeria.push({
//                     name: file.originalFilename,
//                     url: folder + '/' + fileName
//                 });
//             }
//             else {
//                 throw new Error('Error al subir el archivo');
//             }
//         })
//     );

//     return galeria;
// };

const uploadFile = async ({ files, folder }: SingleFileProps): Promise<{ name: string; url: string }[]> => {
    const elements = Array.isArray(files) ? files : [files];

    const results = await Promise.allSettled(
        elements.map(async (file: any) => {
            let bufferedFile: any = file.filepath;
            if (file.mimetype.includes('image')) {
                const tinified = tinify.fromFile(file.filepath);
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

            const data: PutObjectCommandOutput = await s3Client.send(new PutObjectCommand(params));
            if (data.$metadata.httpStatusCode === 200) {
                return {
                    name: file.originalFilename,
                    url: `${folder}/${fileName}`
                };
            } else {
                throw new Error('Error al subir el archivo');
            }
        })
    );

    const galeria: { name: string; url: string }[] = [];
    results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
            // Si la promesa fue cumplida, agregar a la galería
            galeria.push(result.value);
        } else {
            // Si la promesa fue rechazada, manejar el error
            console.error("Error al procesar el archivo:", elements[index].originalFilename);
        }
    });

    return galeria;
};


export {
    uploadFile,
    deleteFile
};

