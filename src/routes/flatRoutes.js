import express from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import Property from '../models/Properties.js';
import Flat from '../models/Flats.js';
import User from '../models/User.js';
import RentalRequest from '../models/RentalRequest.js';

const router = express.Router();

const viewFlatDetails = async (req, res) => {
    try {
        const flatId = req.params.id;
        
        const flat = await Flat.findById(flatId);
        if (!flat) {
            return res.render('error', { message: 'Flat not found' });
        }

        const property = await Property.findOne({ p_id: flat.property_id });
        if (!property) {
            return res.render('error', { message: 'Property not found' });
        }

        const owner = await User.findOne({ username: property.owner_username });
        if (!owner) {
            return res.render('error', { message: 'Owner not found' });
        }

        // Check for pending request
        let pendingRequest = false;
        if (req.session.user) {
            pendingRequest = await RentalRequest.hasPendingRequest(req.session.user.username, flatId);
        }

        // Add error/success message from query params
        const message = req.query.message;
        const error = req.query.error;

        res.render('flatDetails', {
            flat,
            property,
            owner: {
                name: owner.name,
                email: owner.email,
                phone: owner.phone,
                username: owner.username
            },
            user: req.session.user,
            pendingRequest,
            message,
            error
        });

    } catch (error) {
        console.error('Error:', error);
        res.render('error', { message: 'Error loading flat details' });
    }
};

const submitRentRequest = async (req, res) => {
    try {
        const { flatId, ownerUsername } = req.body;
        const requesterUsername = req.session.user.username;

        await RentalRequest.createRequest({
            flat_id: flatId,
            requester_username: requesterUsername,
            owner_username: ownerUsername
        });

        res.redirect(`/flats/${flatId}?message=Request sent successfully`);

    } catch (error) {
        console.error('Error:', error);
        // Check for specific error from model
        if (error.message === 'You already have a pending request for this flat') {
            res.redirect(`/flats/${req.body.flatId}?error=${error.message}`);
        } else {
            res.redirect(`/flats/${req.body.flatId}?error=Failed to send request`);
        }
    }
};

router.get('/:id', viewFlatDetails);
router.post('/:id/request', requireAuth, submitRentRequest);

export default router;