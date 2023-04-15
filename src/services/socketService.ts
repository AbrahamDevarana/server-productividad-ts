import { Server } from "socket.io";
import jwt from 'jsonwebtoken';

    const io = new Server()

const socketService = (server: any) => {
    io.attach(server, {
        cors: {
            origin: "*",
        }
    });
    
    io.on('connection', (socket: any) => {

        const accessToken = socket.handshake.query['token']

        jwt.verify(accessToken, process.env.JWT_SECRET as string, async (error: any, decoded: any) => {
            if (error) {
                console.log('error');
            } else {
                if (decoded) {
                    socket.join(decoded.id);
                }else{
                    console.log('no decoded');
                }
            }
        })


        // Ver si el usuario esta logueado
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });
}

export default socketService;

    