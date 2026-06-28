import { FlatModel } from '../models/Flats.js';
import { uploadToCloudinary } from '../middlewares/uploadMiddleware.js';

export const addFlat = async (req, res) => {
    try {
        // Upload each in-memory file to Cloudinary, collect hosted URLs
        const imagePaths = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const url = await uploadToCloudinary(file.buffer);
                imagePaths.push(url);
            }
        }

        const flatData = {
            ...req.body,
            property_id: parseInt(req.params.p_id),
            images: imagePaths
        };

        await FlatModel.addFlat(flatData);
        res.redirect(`/owner/property/${req.params.p_id}`);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error adding flat');
    }
};
