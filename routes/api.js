var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
    res.send(200);
})

router.get('/tv', (req, res, next) => {
    res.status(200).send('asdf');
})

router.post('/tv', (req, res, next) => {
    res.status(200).send('asdf');
})

module.exports = router;
