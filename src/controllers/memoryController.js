const Memory = require('../models/Memory');
const Pet = require('../models/Pet');
const cloudinary = require('../utils/cloudinary');

// Get memories for a pet
exports.getPetMemories = async (req, res) => {
    try {
        const { petId } = req.params;
        
        // Verify pet ownership
        const pet = await Pet.findOne({ _id: petId, userId: req.userId });
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }
        
        const memories = await Memory.find({ petId })
            .sort('-createdAt')
            .lean();
        
        res.json(memories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all memories for user's pets
exports.getAllMemories = async (req, res) => {
    try {
        // Get all user's pets
        const pets = await Pet.find({ userId: req.userId }).select('_id');
        const petIds = pets.map(pet => pet._id);
        
        const memories = await Memory.find({ petId: { $in: petIds } })
            .populate('petId', 'name breed')
            .sort('-createdAt')
            .lean();
        
        res.json(memories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add memory
exports.addMemory = async (req, res) => {
    try {
        const { petId, caption, isShared } = req.body;
        const isSharedBool = (typeof isShared === 'string') ? (isShared.toLowerCase() === 'true') : !!isShared;
        
        // Verify pet ownership
        const pet = await Pet.findOne({ _id: petId, userId: req.userId });
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }
        
        let imageUrl = null;
        if (req.file) {
            const result = await cloudinary.uploadImageFromBuffer(req.file.buffer, 'memories', req.file.mimetype);
            imageUrl = result.secure_url;
        }
        
        const memory = new Memory({
            petId,
            userId: req.userId,
            imageUrl,
            caption,
            isShared: isSharedBool
        });
        
        await memory.save();
        
        // If shared, create a community post
        if (isSharedBool) {
            const CommunityPost = require('../models/CommunityPost');
            const safeCaption = (caption && String(caption).trim().length > 0) ? caption : 'Shared a memory';
            await CommunityPost.create({
                userId: req.userId,
                petId: pet._id,
                petName: pet.name,
                breed: pet.breed,
                caption: safeCaption,
                imageUrl,
                careTag: 'Memory'
            });
        }
        
        res.status(201).json(memory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update memory
exports.updateMemory = async (req, res) => {
    try {
        const memory = await Memory.findById(req.params.id);
        
        if (!memory) {
            return res.status(404).json({ message: 'Memory not found' });
        }
        
        // Verify ownership
        if (memory.userId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        const { caption, isShared } = req.body;
        
        if (caption !== undefined) memory.caption = caption;
        if (isShared !== undefined) memory.isShared = isShared;
        
        await memory.save();
        res.json(memory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete memory
exports.deleteMemory = async (req, res) => {
    try {
        const memory = await Memory.findById(req.params.id);
        
        if (!memory) {
            return res.status(404).json({ message: 'Memory not found' });
        }
        
        // Verify ownership
        if (memory.userId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        // Delete image from cloudinary if exists
        if (memory.imageUrl) {
            // Extract public_id from URL and delete
            const urlParts = memory.imageUrl.split('/');
            const publicId = urlParts[urlParts.length - 1].split('.')[0];
            await cloudinary.deleteImage(`petzone/memories/${publicId}`);
        }
        
        await Memory.deleteOne({ _id: req.params.id });
        res.json({ message: 'Memory deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};