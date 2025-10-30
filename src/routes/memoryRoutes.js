const express = require('express');
const router = express.Router();
const memoryController = require('../controllers/memoryController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require authentication
router.use(auth);

router.get('/all', memoryController.getAllMemories);
router.get('/pet/:petId', memoryController.getPetMemories);
router.post('/', upload.single('image'), memoryController.addMemory);
router.put('/:id', memoryController.updateMemory);
router.delete('/:id', memoryController.deleteMemory);

module.exports = router;