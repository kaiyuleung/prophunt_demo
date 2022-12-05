const app = require('express')();
const http = require('http').Server(app);

const { instrument } = require('@socket.io/admin-ui')
const io = require('socket.io')(http, {
    cors: {
        origin: ['https://admin.socket.io', 'http://127.0.0.1:5500'],
        methods: ["GET", "POST"],
        credentials: true,
    }
});

io.on('connection', (socket) => {
    console.log(`player ${socket.id} connected`);

    socket.on('join-room', (room, coords, cb) => {
        socket.join(room)

        const playersID = Array.from(io.of("/").adapter.rooms.get(room));

        cb({ id: socket.id, room: room })

        io.to(room).emit('update-room', playersID, socket.id, coords)
    })

    socket.on('moving', (room, coords) => {
        const playersID = Array.from(io.of("/").adapter.rooms.get(room));
        io.to(room).emit('update-room', playersID, socket.id, coords)
    })

    // socket.on('req-update', (room, id) => {
    //     io.to(id).emit('where-are-you', rep => {
    //             console.log("init:", id);
    //             console.log("rep:", rep);
    //             socket.emit('moving', room, rep)
    //         })
    // })

    // socket.on('init-coords', (id, coords) => {
    //     io.to(id).emit('where-are-you', rep => {
    //         console.log("init:", id);
    //         console.log("rep:", rep);
    //         coords(rep)
    //     })
    // })




    socket.on('disconnecting', () => {
        Array.from(socket.rooms).forEach(
            room => {
                let playersID = Array.from(io.of("/").adapter.rooms.get(room)).filter(p => p !== socket.id)
                io.to(room).emit('update-room', playersID, socket.id, null)
            }
        )
    })


    socket.on('disconnect', () => {
        console.log(`player ${socket.id} disconnected`);
    });
});

http.listen(3000, () => {
    console.log('server listening on localhost:3000');
});


instrument(io, {
    auth: false
});
