const express = require('express');
const router = express.Router();
const careLogController = require('../controllers/careLogController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Care logs for specific pet
router.get('/pet/:petId', careLogController.getPetCareLogs);
router.post('/', careLogController.addCareLog);
router.put('/:id', careLogController.updateCareLog);
router.delete('/:id', careLogController.deleteCareLog);

// Additional features
router.get('/reminders', careLogController.getUpcomingReminders);
router.get('/stats/:petId', careLogController.getCareStats);

module.exports = router;