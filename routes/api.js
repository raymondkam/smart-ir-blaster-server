const express = require('express');
const router = express.Router();
const apiConfig = require('../config/api.json');
const WebSocket = require('ws');
const wsConfig = require('../config/websocket.json');

const wss = new WebSocket.Server({ port: 8081 });

let wsClient = null

// auth middleware
const authMiddleware = (req, res, next) => {
    console.log('middleware function running');
    if (!req.headers.authorization) {
        return res.status(401).send({ error: 'No credentials sent' });
    }
    const encoded = req.headers.authorization.split(' ')[1];
    const decoded = new Buffer(encoded, 'base64').toString('utf8');
    const id = decoded.split(':')[0];
    const secret = decoded.split(':')[1];

    if (id !== apiConfig.id || secret !== apiConfig.secret) {
        return res.status(401).send({ error: 'Wrong credentials' });
    }

    next();
}

router.use(authMiddleware);

router.get('/health', (req, res, next) => {
    res.send(200);
})

router.post('/tv', (req, res, next) => {
    let json = req.body;
    if (json != null) {
        console.log('json data: ', json);
        if (wsClient) {
            wsClient.send(JSON.stringify(json));
        }
        res.status(200).send();
    } else {
        res.status(400).send();
    }
})

// ------------------
// WEBSOCKET
// ------------------
wss.on('connection', function connection(ws, req) {
    console.log('req: ', req);

    // TODO: check to see if it is the ip of the raspberry pi/your home public ip
    const ip = req.connection.remoteAddress;
    console.log("ip address 1: ", req.ip);

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        const messageJSON = JSON.parse(message);
        if (messageJSON.token === wsConfig.token) {
            wsClient = ws;

            wsClient.on('message', function incoming(message) {
                console.log("received subsequent message from trusted client: " + message);
            });
            wsClient.on('close', function close() {
                console.log('websocket connection closed');
                wsClient = null
            });
        } else {
            console.log('failed to auth, close connection');
            ws.close(1003, "Missing or bad token");
        }
    });
});

module.exports = router;
