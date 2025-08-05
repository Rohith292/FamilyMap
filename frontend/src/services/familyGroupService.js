// frontend/src/services/familyGroupService.js
import axiosInstance from "../lib/axios"; // Your Axios instance

const familyGroupService = {
    /**
     * Creates a new family group.
     * @param {object} groupData - { name: string, description?: string }
     * @returns {Promise<object>} The created family group object.
     */
    createFamilyGroup: async (groupData) => {
        try {
            const response = await axiosInstance.post('/family-groups', groupData);
            return response.data;
        } catch (error) {
            console.error("Error creating family group:", error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || "Failed to create group.");
        }
    },

    /**
     * Gets all family groups the current user belongs to.
     * @returns {Promise<Array<object>>} An array of family group objects.
     */
    getMyFamilyGroups: async () => {
        try {
            const response = await axiosInstance.get('/family-groups/my');
            return response.data;
        } catch (error) {
            console.error("Error fetching user's family groups:", error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || "Failed to fetch groups.");
        }
    },

    /**
     * Gets a specific family group by ID.
     * @param {string} groupId - The ID of the family group.
     * @returns {Promise<object>} The family group object.
     */
    getFamilyGroupById: async (groupId) => {
        try {
            const response = await axiosInstance.get(`/family-groups/${groupId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching family group ${groupId}:`, error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || "Failed to fetch group details.");
        }
    },
    
    // NEW: Invite member to a group by email
    inviteMember: async (groupId, email) => {
        // Assumes api.baseURL is 'http://localhost:5001/api/'
        // The backend controller `addMemberToFamilyGroup` expects `userIdOrEmail`
        const response = await axiosInstance.put(`/family-groups/${groupId}/add-member`, { userIdOrEmail: email });
        return response.data;
    },


    /**
     * Updates an existing family group.
     * @param {string} groupId - The ID of the family group to update.
     * @param {object} updateData - { name?: string, description?: string }
     * @returns {Promise<object>} The updated family group object.
     */
    updateFamilyGroup: async (groupId, updateData) => {
        try {
            const response = await axiosInstance.put(`/family-groups/${groupId}`, updateData);
            return response.data;
        } catch (error) {
            console.error(`Error updating family group ${groupId}:`, error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || "Failed to update group.");
        }
    },

    /**
     * Adds a member to a family group.
     * @param {string} groupId - The ID of the family group.
     * @param {string} userIdOrEmail - The ID or email of the user to add.
     * @returns {Promise<object>} Response message and updated family group.
     */
    addMemberToFamilyGroup: async (groupId, userIdOrEmail) => {
        try {
            const response = await axiosInstance.put(`/family-groups/${groupId}/add-member`, { userIdOrEmail });
            return response.data;
        } catch (error) {
            console.error(`Error adding member to group ${groupId}:`, error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || "Failed to add member.");
        }
    },

    /**
     * Removes a member from a family group.
     * @param {string} groupId - The ID of the family group.
     * @param {string} memberId - The ID of the member to remove.
     * @returns {Promise<object>} Response message and updated family group.
     */
    removeMemberFromFamilyGroup: async (groupId, memberId) => {
        try {
            const response = await axiosInstance.put(`/family-groups/${groupId}/remove-member`, { memberId });
            return response.data;
        } catch (error) {
            console.error(`Error removing member from group ${groupId}:`, error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || "Failed to remove member.");
        }
    },

    /**
     * Deletes a family group.
     * @param {string} groupId - The ID of the family group to delete.
     * @returns {Promise<object>} Response message.
     */
    deleteFamilyGroup: async (groupId) => {
        try {
            const response = await axiosInstance.delete(`/family-groups/${groupId}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting family group ${groupId}:`, error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || "Failed to delete group.");
        }
    },
};

export default familyGroupService;