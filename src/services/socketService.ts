import { Server } from "socket.io";
import jwt from 'jsonwebtoken';
import fs from 'fs';

    const io = new Server()

const socketService = (server: any) => {
    io.attach(server, {
        cors: {
            origin: "*",
        }
    });
    
    io.on('connection', (socket: any) => {

        const accessToken = socket.handshake.query['token']
        
        if(!accessToken || accessToken !== 'null') {
            jwt.verify(accessToken, process.env.JWT_SECRET as string, async (error: any, decoded: any) => {
                if (error) {
                    const errorinfo = `${new Date(Date.now()).toLocaleString()} - ${error} \n`
                    console.log(errorinfo);
                    fs.appendFile('src/logs/error.log', errorinfo, function (err) {
                        if (error) throw error;
                        process.exit(1);
                    })
                } else {
                    if (decoded) {
                        socket.join(decoded.id);
                    }else{
                        console.log('no decoded');
                    }
                }
            })
        }else{
            socket.disconnect();
        }


        // Ver si el usuario esta logueado
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });
}

export default socketService;

    