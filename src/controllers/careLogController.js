const CareLog = require('../models/CareLog');
const Pet = require('../models/Pet');
const CommunityPost = require('../models/CommunityPost');

// Get care logs for a pet
exports.getPetCareLogs = async (req, res) => {
    try {
        const { petId } = req.params;
        const { type } = req.query;
        
        // Verify pet ownership
        const pet = await Pet.findOne({ _id: petId, userId: req.userId });
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }
        
        const query = { petId };
        if (type) query.type = type;
        
        const careLogs = await CareLog.find(query)
            .sort('-date')
            .lean();
        
        res.json(careLogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add care log
exports.addCareLog = async (req, res) => {
    try {
        const { petId, type, details, date, reminder, shareWithCommunity } = req.body;
        
        // Verify pet ownership
        const pet = await Pet.findOne({ _id: petId, userId: req.userId });
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }
        
        const careLog = new CareLog({
            petId,
            userId: req.userId,
            type,
            details,
            date: date || Date.now(),
            reminder,
            shareWithCommunity
        });
        
        await careLog.save();
        
        // Share to community if requested
        if (shareWithCommunity) {
            let caption = '';
            let careTag = type;
            
            switch(type) {
                case 'Feeding':
                    caption = `${pet.name} enjoyed ${details.foodType || 'meal'} today!`;
                    break;
                case 'Grooming':
                    caption = `${pet.name} had a ${details.groomingType || 'grooming session'}!`;
                    break;
                case 'Exercise':
                    caption = `${pet.name} had ${details.duration || '30'} minutes of ${details.activityType || 'exercise'}!`;
                    break;
                case 'VetVisit':
                    caption = `${pet.name} had a vet visit for ${details.reason || 'checkup'}`;
                    careTag = 'Health';
                    break;
                case 'Vaccination':
                    caption = `${pet.name} received ${details.vaccineName || 'vaccination'}`;
                    careTag = 'Health';
                    break;
                default:
                    caption = `${pet.name} care update`;
            }
            
            await CommunityPost.create({
                userId: req.userId,
                petId: pet._id,
                petName: pet.name,
                breed: pet.breed,
                caption,
                careTag
            });
        }
        
        res.status(201).json(careLog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update care log
exports.updateCareLog = async (req, res) => {
    try {
        const careLog = await CareLog.findById(req.params.id);
        
        if (!careLog) {
            return res.status(404).json({ message: 'Care log not found' });
        }
        
        // Verify ownership
        if (careLog.userId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        Object.assign(careLog, req.body);
        await careLog.save();
        
        res.json(careLog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete care log
exports.deleteCareLog = async (req, res) => {
    try {
        const careLog = await CareLog.findById(req.params.id);
        
        if (!careLog) {
            return res.status(404).json({ message: 'Care log not found' });
        }
        
        // Verify ownership
        if (careLog.userId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        await CareLog.deleteOne({ _id: req.params.id });
        res.json({ message: 'Care log deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get upcoming reminders
exports.getUpcomingReminders = async (req, res) => {
    try {
        // Get all user's pets
        const pets = await Pet.find({ userId: req.userId }).select('_id');
        const petIds = pets.map(pet => pet._id);
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 7); // Next 7 days
        
        const reminders = await CareLog.find({
            petId: { $in: petIds },
            'reminder.enabled': true,
            'reminder.nextDate': { $lte: tomorrow, $gte: new Date() }
        })
        .populate('petId', 'name')
        .sort('reminder.nextDate')
        .lean();
        
        res.json(reminders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get care statistics
exports.getCareStats = async (req, res) => {
    try {
        const { petId } = req.params;
        const { startDate, endDate } = req.query;
        
        // Verify pet ownership
        const pet = await Pet.findOne({ _id: petId, userId: req.userId });
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }
        
        const query = { petId };
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const stats = await CareLog.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    totalCost: { $sum: '$details.cost' },
                    lastDate: { $max: '$date' }
                }
            },
            {
                $project: {
                    type: '$_id',
                    count: 1,
                    totalCost: 1,
                    lastDate: 1,
                    _id: 0
                }
            }
        ]);
        
        res.json({
            pet: {
                name: pet.name,
                breed: pet.breed,
                age: pet.age
            },
            stats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};