const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    petName: {
        type: String,
        required: true
    },
    breed: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        required: true,
        maxlength: 500
    },
    imageUrl: {
        type: String,
        default: null
    },
    careTag: {
        type: String,
        enum: ['Feeding', 'Grooming', 'Exercise', 'Health', 'Memory', 'Other'],
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    reports: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: String,
        reportedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isPublic: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual for likes count
communityPostSchema.virtual('likesCount').get(function() {
    return this.likes.length;
});

// Index for efficient queries
communityPostSchema.index({ createdAt: -1 });
communityPostSchema.index({ userId: 1 });
communityPostSchema.index({ petId: 1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);