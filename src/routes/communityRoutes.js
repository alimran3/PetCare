const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

// Public routes (authentication optional for viewing)
router.get('/feed', optionalAuth, communityController.getFeed);

// Protected routes
router.post('/posts', auth, communityController.createPost);
router.post('/posts/:postId/like', auth, communityController.toggleLike);
router.post('/posts/:postId/report', auth, communityController.reportPost);
router.get('/my-posts', auth, communityController.getMyPosts);
router.delete('/posts/:postId', auth, communityController.deletePost);

module.exports = router;