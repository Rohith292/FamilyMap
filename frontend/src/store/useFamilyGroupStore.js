// frontend/src/store/useFamilyGroupStore.js
import { create } from 'zustand';
import familyGroupService from '../services/familyGroupService';
import toast from 'react-hot-toast';

const useFamilyGroupStore = create((set, get) => ({
    // State for all groups the user is a member of
    myFamilyGroups: [],
    isLoadingGroups: false,
    groupsError: null,

    // State for a currently viewed group (e.g., when viewing group details)
    currentGroup: null,
    isLoadingCurrentGroup: false,
    currentGroupError: null,

    /**
     * Fetches all family groups the authenticated user belongs to.
     */
    fetchMyFamilyGroups: async () => {
        set({ isLoadingGroups: true, groupsError: null });
        try {
            const groups = await familyGroupService.getMyFamilyGroups();
            set({ myFamilyGroups: groups, isLoadingGroups: false });
        } catch (error) {
            set({ groupsError: error.message, isLoadingGroups: false });
            toast.error(error.message);
        }
    },

    /**
     * Fetches details for a specific family group.
     * @param {string} groupId - The ID of the group to fetch.
     */
    fetchFamilyGroupDetails: async (groupId) => {
        set({ isLoadingCurrentGroup: true, currentGroupError: null });
        try {
            const group = await familyGroupService.getFamilyGroupById(groupId);
            set({ currentGroup: group, isLoadingCurrentGroup: false });
        } catch (error) {
            set({ currentGroupError: error.message, isLoadingCurrentGroup: false });
            toast.error(error.message);
        }
    },

    /**
     * Creates a new family group.
     * @param {object} groupData - { name, description }
     */
    createFamilyGroup: async (groupData) => {
        set({ isLoadingGroups: true, groupsError: null }); // Using groups loading state for creation
        try {
            const newGroup = await familyGroupService.createFamilyGroup(groupData);
            set((state) => ({
                myFamilyGroups: [...state.myFamilyGroups, newGroup],
                isLoadingGroups: false
            }));
            toast.success('Family group created successfully!');
            return newGroup;
        } catch (error) {
            set({ groupsError: error.message, isLoadingGroups: false });
            toast.error(error.message);
            throw error; // Re-throw to allow component to handle if needed
        }
    },
    // NEW: Fetch single family group by ID
    fetchFamilyGroupById: async (groupId) => {
        set({ isLoadingGroups: true, groupsError: null, currentFamilyGroup: null });
        try {
            const group = await familyGroupService.getFamilyGroupById(groupId);
            set({ currentFamilyGroup: group, isLoadingGroups: false });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch group details.';
            set({ groupsError: errorMessage, isLoadingGroups: false });
            toast.error(errorMessage);
        }
    },

    // NEW: Invite member to group
    inviteMemberToGroup: async (groupId, email) => {
        set({ groupsError: null }); // Clear previous errors
        try {
            const updatedGroup = await familyGroupService.inviteMember(groupId, email);
            set({ currentFamilyGroup: updatedGroup }); // Update the current group in state
            toast.success(`Invitation sent to ${email}!`);
            return updatedGroup;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to send invitation.';
            set({ groupsError: errorMessage });
            toast.error(errorMessage);
            throw error; // Re-throw for component to catch
        }
    },


    /**
     * Updates an existing family group.
     * @param {string} groupId - ID of the group to update.
     * @param {object} updateData - { name?, description? }
     */
    updateFamilyGroup: async (groupId, updateData) => {
        set({ isLoadingCurrentGroup: true, currentGroupError: null });
        try {
            const updatedGroup = await familyGroupService.updateFamilyGroup(groupId, updateData);
            set((state) => ({
                // Update in myFamilyGroups list
                myFamilyGroups: state.myFamilyGroups.map(group =>
                    group._id === updatedGroup._id ? updatedGroup : group
                ),
                // Update if it's the current group being viewed
                currentGroup: state.currentGroup?._id === updatedGroup._id ? updatedGroup : state.currentGroup,
                isLoadingCurrentGroup: false
            }));
            toast.success('Family group updated successfully!');
            return updatedGroup;
        } catch (error) {
            set({ currentGroupError: error.message, isLoadingCurrentGroup: false });
            toast.error(error.message);
            throw error;
        }
    },

    /**
     * Adds a member to a family group.
     * @param {string} groupId - ID of the group.
     * @param {string} userIdOrEmail - ID or email of the user to add.
     */
    addMemberToGroup: async (groupId, userIdOrEmail) => {
        set({ isLoadingCurrentGroup: true, currentGroupError: null });
        try {
            const response = await familyGroupService.addMemberToFamilyGroup(groupId, userIdOrEmail);
            set((state) => ({
                currentGroup: response.familyGroup, // Backend returns updated group
                isLoadingCurrentGroup: false
            }));
            // Optionally, re-fetch myFamilyGroups if the current user was added to a group they weren't in
            // if (response.familyGroup.members.some(member => member._id === authUser._id)) { // Requires authUser in store
            //   get().fetchMyFamilyGroups();
            // }
            toast.success(response.message || 'Member added successfully!');
            return response.familyGroup;
        } catch (error) {
            set({ currentGroupError: error.message, isLoadingCurrentGroup: false });
            toast.error(error.message);
            throw error;
        }
    },

    /**
     * Removes a member from a family group.
     * @param {string} groupId - ID of the group.
     * @param {string} memberId - ID of the member to remove.
     */
    removeMemberFromGroup: async (groupId, memberId) => {
        set({ isLoadingCurrentGroup: true, currentGroupError: null });
        try {
            const response = await familyGroupService.removeMemberFromFamilyGroup(groupId, memberId);
            set((state) => ({
                currentGroup: response.familyGroup, // Backend returns updated group
                isLoadingCurrentGroup: false
            }));
            // Optionally, re-fetch myFamilyGroups if the current user was removed from a group
            // if (memberId === authUser._id) {
            //   get().fetchMyFamilyGroups();
            // }
            toast.success(response.message || 'Member removed successfully!');
            return response.familyGroup;
        } catch (error) {
            set({ currentGroupError: error.message, isLoadingCurrentGroup: false });
            toast.error(error.message);
            throw error;
        }
    },

    /**
     * Deletes a family group.
     * @param {string} groupId - ID of the group to delete.
     */
    deleteFamilyGroup: async (groupId) => {
        set({ isLoadingGroups: true, groupsError: null }); // Use groups loading state for deletion
        try {
            const response = await familyGroupService.deleteFamilyGroup(groupId);
            set((state) => ({
                myFamilyGroups: state.myFamilyGroups.filter(group => group._id !== groupId),
                isLoadingGroups: false,
                currentGroup: state.currentGroup?._id === groupId ? null : state.currentGroup // Clear current group if it was deleted
            }));
            toast.success(response.message || 'Family group deleted successfully!');
        } catch (error) {
            set({ groupsError: error.message, isLoadingGroups: false });
            toast.error(error.message);
            throw error;
        }
    },

    // Helper to clear current group state when navigating away
    clearCurrentGroup: () => set({ currentGroup: null, currentGroupError: null, isLoadingCurrentGroup: false }),
}));

export default useFamilyGroupStore;