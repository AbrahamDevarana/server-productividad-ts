import { Server } from "socket.io";
import jwt from 'jsonwebtoken';
import fs from 'fs';

const io = new Server()

const socketService = (server: any) => {
    io.attach(server, {
        // cors: {
        //     origin: "*",
        // }
    });
    
    io.on('connection', (socket: any) => {


        const accessToken = socket.handshake.query['token']


        if(!accessToken || accessToken === 'null'){
            socket.emit('autentication_failed')
            socket.disconnect()
        }else {
            jwt.verify(accessToken, process.env.JWT_SECRET as string, async (error: any, decoded: any) => {
                if (error) {
                    const errorinfo = `${new Date(Date.now()).toLocaleString()} - ${error} \n`
                    socket.emit('autentication_failed')
                    socket.disconnect()
                } else {
                    if (decoded) {
                        socket.join(decoded.id);
                    }else{
                        socket.emit('authentication_failed');
                        socket.disconnect();
                    }
                }
            })
        }
        
        // Ver si el usuario esta logueado
        socket.on('disconnect', () => {
            console.log('Usuario desconectado:', socket.id);
            // Realizar acciones adicionales si es necesario
        });
    });
}

export { io, socketService };

    