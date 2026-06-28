import express from "express";
import { PropertyModel } from '../models/Properties.js';
import { FlatModel } from '../models/Flats.js';

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        // Fetch all vacant flats (no owner exclusion since visitor may not be logged in)
        const properties = await PropertyModel.getAllProperties();
        const propertyIds = properties.map(p => p.p_id);
        const flats = await FlatModel.getVacantFlats(propertyIds);

        const flatsToShow = flats.map(flat => {
            const property = properties.find(p => p.p_id === flat.property_id);
            return {
                ...flat._doc,
                property_name: property ? property.property_name : '',
                location_area: property ? property.location_area : '',
                address: property ? property.address : ''
            };
        });

        res.render('index', { flats: flatsToShow });
    } catch (error) {
        console.error('Error loading homepage flats:', error);
        res.render('index', { flats: [] });
    }
});

export default router;
