import axios from 'axios';

export const uploadToCloudinary = async (file, cloudName, uploadPreset) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            formData
        );
        return response.data;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};
