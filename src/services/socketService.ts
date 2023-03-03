import { Server } from "socket.io";

    const io = new Server()

const socketService = (server: any) => {
    io.attach(server, {
        cors: {
            origin: "*",
        }
    });
    
    io.on('connection', (socket: any) => {
        // Ver si el usuario esta logueado
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });
}

export default socketService;

    