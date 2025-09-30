const express = require('express');
const router = express.Router();
const tasks = require('../controllers/taskControllers');

router.get('/', tasks.listTasks);
router.get('/:id', tasks.getTask);
router.post('/', tasks.createTask);
router.put('/:id', tasks.updateTask);
router.delete('/:id', tasks.deleteTask);

module.exports = router;
