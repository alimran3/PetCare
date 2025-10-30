module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    jwtExpiration: '30d',
    
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/petzone',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },
    
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    },
    
    pagination: {
        defaultLimit: 20,
        maxLimit: 100
    },
    
    uploads: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedFormats: ['jpg', 'jpeg', 'png', 'gif']
    }
};