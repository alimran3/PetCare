const CommunityPost = require('../models/CommunityPost');
const Pet = require('../models/Pet');

// Get community feed
exports.getFeed = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const posts = await CommunityPost.find({ isPublic: true })
            .sort('-createdAt')
            .limit(limit)
            .skip(skip)
            .lean();

        // Add isLiked flag for authenticated users
        if (req.userId) {
            posts.forEach(post => {
                post.isLiked = post.likes.some(like => like.toString() === req.userId);
                post.likesCount = post.likes.length;
            });
        }

        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create community post
exports.createPost = async (req, res) => {
    try {
        const { petId, caption, careTag, imageUrl } = req.body;

        // Verify pet ownership
        const pet = await Pet.findOne({ _id: petId, userId: req.userId });
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        const post = new CommunityPost({
            userId: req.userId,
            petId: pet._id,
            petName: pet.name,
            breed: pet.breed,
            caption,
            careTag,
            imageUrl
        });

        await post.save();
        res.status(201).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Like/Unlike post
exports.toggleLike = async (req, res) => {
    try {
        const post = await CommunityPost.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const userIndex = post.likes.findIndex(like => like.toString() === req.userId);
        
        if (userIndex === -1) {
            // Like the post
            post.likes.push(req.userId);
        } else {
            // Unlike the post
            post.likes.splice(userIndex, 1);
        }

        await post.save();
        
        res.json({ 
            liked: userIndex === -1,
            likesCount: post.likes.length 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Report post
exports.reportPost = async (req, res) => {
    try {
        const { reason } = req.body;
        
        const post = await CommunityPost.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user already reported
        const alreadyReported = post.reports.some(
            report => report.userId.toString() === req.userId
        );
        
        if (alreadyReported) {
            return res.status(400).json({ message: 'You have already reported this post' });
        }

        post.reports.push({
            userId: req.userId,
            reason
        });

        // Auto-hide post if it gets too many reports
        if (post.reports.length >= 5) {
            post.isPublic = false;
        }

        await post.save();
        res.json({ message: 'Post reported successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get my community posts
exports.getMyPosts = async (req, res) => {
    try {
        const posts = await CommunityPost.find({ userId: req.userId })
            .sort('-createdAt')
            .lean();

        posts.forEach(post => {
            post.likesCount = post.likes.length;
            post.isLiked = post.likes.some(like => like.toString() === req.userId);
        });

        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete post
exports.deletePost = async (req, res) => {
    try {
        const post = await CommunityPost.findOne({ 
            _id: req.params.postId, 
            userId: req.userId 
        });
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        await post.deleteOne();
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};