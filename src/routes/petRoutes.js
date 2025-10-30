const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require authentication
router.use(auth);

router.get('/', petController.getMyPets);
router.get('/:id', petController.getPet);
router.post('/', petController.addPet);
router.put('/:id', petController.updatePet);
router.post('/:id/photo', upload.single('photo'), petController.uploadPetPhoto);
router.delete('/:id', petController.deletePet);
router.get('/:id/stats', petController.getPetStats);

module.exports = router;