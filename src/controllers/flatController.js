import { FlatModel } from '../models/Flats.js';

export const addFlat = async (req, res) => {
    try {
        // Cloudinary returns the hosted URL in file.path
        const imagePaths = req.files.map(file => file.path);
        
        // Create flat with images
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