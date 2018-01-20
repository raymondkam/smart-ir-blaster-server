const express = require('express');
const router = express.Router();
const commandsJSON = require('../config/commands');

let wsClient = null;

// auth middleware
const authMiddleware = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send({ error: 'No credentials sent' });
    }
    const encoded = req.headers.authorization.split(' ')[1];
    const decoded = new Buffer(encoded, 'base64').toString('utf8');
    const id = decoded.split(':')[0];
    const secret = decoded.split(':')[1];

    if (id !== process.env.API_ID || secret !== process.env.API_SECRET) {
        return res.status(401).send({ error: 'Wrong credentials' });
    }

    next();
}

router.use(authMiddleware);

router.get('/health', (req, res, next) => {
    res.send(200);
})

router.post('/tv', (req, res, next) => {
    let commandId = req.query.commandId;
    if (commandId != null) {
        if (wsClient) {
            console.log('WS: sending command: ', commandId);
            let wsMessage = {
                "type": "command",
                "message": commandId
            }
            wsClient.send(JSON.stringify(wsMessage));
        }
        res.status(200).send();
    } else {
        res.status(400).send();
    }
})

module.exports = {
    'router': router,
    'setWsClient': (newWsClient) => {
        wsClient = newWsClient;
    }
}
