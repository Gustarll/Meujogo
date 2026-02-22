const io = require("socket.io")(process.env.PORT || 3000, {
    cors: { origin: "*" }
});

let salas = {};

io.on("connection", (socket) => {
    socket.on("join-room", (data) => {
        socket.join(data.room);
        socket.room = data.room;
        if (!salas[data.room]) salas[data.room] = { players: {}, walls: [] };
        
        salas[data.room].players[socket.id] = { id: socket.id, n: data.nick, x: data.x, y: data.y, k: 0 };
        io.to(data.room).emit("update-players", salas[data.room].players);
        socket.emit("update-walls", salas[data.room].walls);
    });

    socket.on("move", (data) => {
        if (salas[socket.room] && salas[socket.room].players[socket.id]) {
            salas[socket.room].players[socket.id].x = data.x;
            salas[socket.room].players[socket.id].y = data.y;
            socket.to(socket.room).emit("player-moved", { id: socket.id, x: data.x, y: data.y });
        }
    });

    socket.on("disconnect", () => {
        if (salas[socket.room]) {
            delete salas[socket.room].players[socket.id];
            io.to(socket.room).emit("update-players", salas[socket.room].players);
        }
    });
});

console.log("Servidor rodando liso!");