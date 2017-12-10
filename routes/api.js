const express = require('express');
const router = express.Router();
const apiConfig = require('../config/api.json');

let wsClient = null;

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
        if (wsClient) {
            wsClient.send(JSON.stringify(json));
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
