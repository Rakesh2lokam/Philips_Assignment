const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
io.set('origins', '*:*');


var cors = require('cors');
app.use(cors());
app.options('*', cors());
// function random data point

io.on("connection", socket => {
    let previousId;
    const safeJoin = currentId => {
        socket.leave(previousId);
        socket.join(currentId);
        previousId = currentId;
    };

    socket.on("createData", channelId => {
        safeJoin(channelId);
        let dataObj = {
            id: channelId,
            datapoint: Number(Math.random() * 100).toFixed(0)
        };
        socket.emit("dataPoint", dataObj);
    });
    // on kill socket clear datapoint
});

http.listen(4444, function (req, res) {
    console.log('Listening on 4444...');
});