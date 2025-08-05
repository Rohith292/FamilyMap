    import express from 'express';
    import { protectRoute } from '../middleware/auth.middleware.js';
    import {
        sendInvitation,
        acceptInvitation,
        declineInvitation,
        revokeAccess,
        updateRole,
        deleteCollaborationRecord
    } from '../controllers/collaboration.controller.js';

    const router = express.Router();

    // All collaboration routes require authentication
    router.use(protectRoute);

    // Owner actions
    router.post('/invite', sendInvitation); // Send an invitation
    router.delete('/:id/revoke', revokeAccess); // Revoke access for a collaborator
    router.put('/:id/role', updateRole); // Update a collaborator's role

    // Collaborator actions (on their received invitations)
    router.put('/:id/accept', acceptInvitation); // Accept an invitation
    router.put('/:id/decline', declineInvitation); // Decline an invitation

    router.delete('/:id', protectRoute, deleteCollaborationRecord);

    export default router;
    