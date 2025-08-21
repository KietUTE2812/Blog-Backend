const express = require('express');
const upload = require('../service/cloudinaryService');
const response = require('../config/response');

const router = express.Router();

router.post('/upload', upload.single('image'), (req, res) => {
    console.log(req.file);
    response(res, 200, 'Image uploaded successfully', {
        url: req.file.path
    });
});

module.exports = router;