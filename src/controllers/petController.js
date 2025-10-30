const Pet = require('../models/Pet');
const CareLog = require('../models/CareLog');
const cloudinary = require('../utils/cloudinary');
const mongoose = require('mongoose');

// Get all pets for a user
exports.getMyPets = async (req, res) => {
    try {
        const pets = await Pet.find({ userId: req.userId }).sort('-createdAt');
        res.json(pets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single pet
exports.getPet = async (req, res) => {
    try {
        const pet = await Pet.findOne({ _id: req.params.id, userId: req.userId });
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }
        res.json(pet);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add new pet
exports.addPet = async (req, res) => {
    try {
        const { name, species, breed, dateOfBirth, gender, weight, microchipId, notes } = req.body;
        
        const pet = new Pet({
            userId: req.userId,
            name,
            species,
            breed,
            dateOfBirth,
            gender,
            weight,
            microchipId,
            notes
        });

        await pet.save();
        res.status(201).json(pet);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update pet
exports.updatePet = async (req, res) => {
    try {
        const pet = await Pet.findOne({ _id: req.params.id, userId: req.userId });
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        Object.assign(pet, req.body);
        pet.updatedAt = Date.now();
        
        await pet.save();
        res.json(pet);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Upload pet photo
exports.uploadPetPhoto = async (req, res) => {
    try {
        const pet = await Pet.findOne({ _id: req.params.id, userId: req.userId });
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploadImage(req.file.path, 'pets');
        
        pet.photoUrl = result.secure_url;
        await pet.save();

        // Return the full updated pet so clients can refresh their local state
        res.json(pet);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete pet
exports.deletePet = async (req, res) => {
    try {
        const pet = await Pet.findOne({ _id: req.params.id, userId: req.userId });
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        // Delete all care logs for this pet
        await CareLog.deleteMany({ petId: pet._id });

        await pet.deleteOne();
        res.json({ message: 'Pet deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get pet statistics
exports.getPetStats = async (req, res) => {
    try {
        const petId = req.params.id;
        
        // Verify pet ownership
        const pet = await Pet.findOne({ _id: petId, userId: req.userId });
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        // Get care log statistics
        const stats = await CareLog.aggregate([
            { $match: { petId: mongoose.Types.ObjectId(petId) } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    lastDate: { $max: '$date' }
                }
            }
        ]);

        res.json({
            pet,
            careStats: stats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};