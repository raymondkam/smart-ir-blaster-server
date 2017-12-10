const express = require('express');
const router = express.Router();
const WebSocket = require('ws');
const wsConfig = require('../config/websocket.json');

const wss = new WebSocket.Server({ port: 8081 });

let client = null

wss.on('connection', function connection(ws, req) {
    console.log('req: ', req);
    const ip = req.connection.remoteAddress;
    console.log("ip address 1: ", req.ip);

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        const messageJSON = JSON.parse(message);
        if (messageJSON.token === wsConfig.token) {
            client = ws;

            client.on('message', function incoming(message) {
                console.log("received subsequent message from trusted client: " + message);
            });
            client.on('close', function close() {
                console.log('websocket connection closed');
                client = null
            });
        } else {
            console.log('failed to auth, close connection');
            ws.close(1003, "Missing or bad token");
        }
    });
});

router.get('/health', (req, res, next) => {
    res.send(200);
})

router.post('/tv', (req, res, next) => {
    let json = req.body;
    if (json != null) {
        console.log('json data: ', json);
        if (client) {
            client.send(JSON.stringify(json));
        }
        res.status(200).send();
    } else {
        res.status(400).send();
    }
})

module.exports = router;
