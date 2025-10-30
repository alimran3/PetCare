const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
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
    imageUrl: {
        type: String,
        default: null
    },
    videoUrl: {
        type: String,
        default: null
    },
    caption: {
        type: String,
        maxlength: 500
    },
    tags: [{
        type: String
    }],
    isShared: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
memorySchema.index({ petId: 1, createdAt: -1 });
memorySchema.index({ userId: 1 });

module.exports = mongoose.model('Memory', memorySchema);