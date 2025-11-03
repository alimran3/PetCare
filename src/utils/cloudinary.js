const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.uploadImage = async (filePath, folder) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: `petzone/${folder}`,
            resource_type: 'auto'
        });
        
        // Delete local file after upload
        fs.unlinkSync(filePath);
        
        return result;
    } catch (error) {
        // Delete local file if upload fails
        fs.unlinkSync(filePath);
        throw error;
    }
};

// Upload image directly from a memory buffer (for serverless environments)
exports.uploadImageFromBuffer = async (buffer, folder, mimetype = 'image/jpeg') => {
    const base64 = buffer.toString('base64');
    const dataUri = `data:${mimetype};base64,${base64}`;
    const result = await cloudinary.uploader.upload(dataUri, {
        folder: `petzone/${folder}`,
        resource_type: 'auto'
    });
    return result;
};

exports.deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw error;
    }
};