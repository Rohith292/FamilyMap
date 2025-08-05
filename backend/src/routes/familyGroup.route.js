// backend/routes/familyGroupRoutes.js
import express from 'express';
import {
    createFamilyGroup,
    getMyFamilyGroups,
    getFamilyGroupById,
    updateFamilyGroup,
    addMemberToFamilyGroup,
    removeMemberFromFamilyGroup,
    deleteFamilyGroup,
} from '../controllers/familyGroup.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js'; // Your authentication middleware

const router = express.Router();

// Routes for Family Group management
router.route('/')
    .post(protectRoute, createFamilyGroup); // Create a new group
router.route('/my')
    .get(protectRoute, getMyFamilyGroups); // Get groups the current user belongs to
 // <--- This route is needed

router.route('/:id')
    .get(protectRoute, getFamilyGroupById) // Get a specific group by ID
    .put(protectRoute, updateFamilyGroup) // Update group details
    .delete(protectRoute, deleteFamilyGroup); // Delete a group

router.route('/:id/add-member')
    .put(protectRoute, addMemberToFamilyGroup); // Add a member to a group

router.route('/:id/remove-member')
    .put(protectRoute, removeMemberFromFamilyGroup); // Remove a member from a group

export default router;
