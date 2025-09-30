const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectControllers');

router.get('/', projectController.listProjects);

router.post('/', projectController.createProject);

module.exports = router;
