const mongoose = require('mongoose');

const careLogSchema = new mongoose.Schema({
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Feeding', 'Grooming', 'Exercise', 'Medication', 'VetVisit', 'Vaccination']
    },
    details: {
        // For Feeding
        foodType: String,
        foodBrand: String,
        amount: String,
        // Morning/Noon/Night slot
        timeSlot: String,
        
        // For Grooming
        groomingType: String, // Bath, Nail Trim, Brushing, etc.
        
        // For Exercise
        duration: Number, // in minutes
        distance: Number, // in km
        activityType: String,
        
        // For Medication
        medicationName: String,
        dosage: String,
        
        // For Vet Visit
        veterinarianName: String,
        clinic: String,
        reason: String,
        diagnosis: String,
        treatment: String,
        
        // For Vaccination
        vaccineName: String,
        nextDueDate: Date,
        
        // Common
        notes: String,
        cost: Number
    },
    date: {
        type: Date,
        default: Date.now
    },
    reminder: {
        enabled: {
            type: Boolean,
            default: false
        },
        nextDate: Date,
        frequency: {
            type: String,
            enum: ['Daily', 'Weekly', 'Monthly', 'Custom']
        }
    },
    shareWithCommunity: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
careLogSchema.index({ petId: 1, type: 1, date: -1 });
careLogSchema.index({ userId: 1 });

module.exports = mongoose.model('CareLog', careLogSchema);