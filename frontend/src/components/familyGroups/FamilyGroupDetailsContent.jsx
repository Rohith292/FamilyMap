// frontend/src/pages/FamilyGroupDetailsPage.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useFamilyGroupStore from '../../store/useFamilyGroupStore';
import useFamilyMemberStore from '../../store/useFamilyMemberStore';
import AddEditMemberForm from '../family/AddEditMemberForm';
import Modal from '../common/Modal';
import { MdArrowBack, MdPersonAdd, MdEdit, MdDelete, MdGroup, MdAccountTree, MdPhotoAlbum } from 'react-icons/md';
import toast from 'react-hot-toast';
import GroupPhotoAlbums from '../familyGroups/GroupPhotoAlbums'; // NEW IMPORT

function FamilyGroupDetailsContent({ groupId }) {
    const navigate = useNavigate();
    const {
        currentFamilyGroup,
        isLoadingGroups,
        groupsError,
        fetchFamilyGroupById,
        inviteMemberToGroup,
        removeMemberFromGroup,
        updateFamilyGroup,
        deleteFamilyGroup,
    } = useFamilyGroupStore();

    const {
        familyMembersInGroup,
        isLoadingMembers,
        membersError,
        fetchFamilyMembersForGroup
    } = useFamilyMemberStore();

    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

    useEffect(() => {
        if (groupId) {
            fetchFamilyGroupById(groupId);
            fetchFamilyMembersForGroup(groupId);
        }
    }, [groupId, fetchFamilyGroupById, fetchFamilyMembersForGroup]);

    const handleInviteSubmit = async (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) {
            toast.error('Please enter an email to invite.');
            return;
        }

        setIsInviting(true);
        try {
            await inviteMemberToGroup(groupId, inviteEmail);
            setInviteEmail('');
            fetchFamilyGroupById(groupId);
        } catch (error) {
            console.error('Failed to invite member:', error);
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (window.confirm("Are you sure you want to remove this member from the group?")) {
            try {
                await removeMemberFromGroup(groupId, memberId);
                fetchFamilyGroupById(groupId);
            } catch (error) {
                console.error('Failed to remove member:', error);
            }
        }
    };

    const handleEditGroup = async () => {
        const newDescription = prompt("Enter new description for the group:", currentFamilyGroup.description);
        if (newDescription !== null) {
            try {
                await updateFamilyGroup(groupId, { description: newDescription });
                fetchFamilyGroupById(groupId);
            } catch (error) {
                console.error('Failed to update group:', error);
            }
        }
    };

    const handleDeleteGroup = async () => {
        if (window.confirm(`Are you sure you want to delete the group "${currentFamilyGroup.name}"? This action cannot be undone.`)) {
            try {
                await deleteFamilyGroup(groupId);
                toast.success('Family group deleted successfully!');
                navigate('/family-groups');
            } catch (error) {
                console.error('Failed to delete group:', error);
            }
        }
    };

    const navigateToGroupTree = () => {
        navigate(`/family-groups/${groupId}/tree`);
    };

    const handleOpenAddMemberModal = () => {
        setIsAddMemberModalOpen(true);
    };

    const handleMemberAddedOrEdited = () => {
        fetchFamilyMembersForGroup(groupId);
        setIsAddMemberModalOpen(false);
    };

    if (isLoadingGroups) {
        return (
            // Replaced hardcoded text-gray-300 with theme-aware text-base-content
            <div className="p-8 text-center text-base-content flex-1 flex items-center justify-center min-h-[50vh]">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="mt-2">Loading group details...</p>
            </div>
        );
    }

    if (groupsError) {
        return (
            // Replaced hardcoded text-red-400 with theme-aware text-error
            <div className="p-8 text-center text-error flex-1 flex flex-col items-center justify-center min-h-[50vh]">
                <h2 className="text-2xl font-bold mb-4">Error!</h2>
                <p>{groupsError}</p>
                <button
                    onClick={() => fetchFamilyGroupById(groupId)}
                    className="btn btn-secondary mt-4"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!currentFamilyGroup) {
        return (
            // Replaced hardcoded text-gray-300 with theme-aware text-base-content
            <div className="p-8 text-center text-base-content flex-1 flex flex-col items-center justify-center min-h-[50vh]">
                <h2 className="text-2xl font-bold mb-4">Group Not Found</h2>
                <p>The family group you are looking for does not exist or you do not have access.</p>
                <button
                    onClick={() => navigate('/family-groups')}
                    className="btn btn-primary mt-4"
                >
                    Go to My Family Groups
                </button>
            </div>
        );
    }

    return (
        // Replaced hardcoded text-gray-300 with theme-aware text-base-content
        <div className="p-8 text-base-content w-full ">
            <button
                // Replaced hardcoded text/bg colors with semantic DaisyUI classes
                onClick={() => navigate('/family-groups')}
                className="btn btn-ghost text-success hover:text-success hover:bg-opacity-20 mb-6 flex items-center gap-2 mt-4"
            >
                <MdArrowBack className="h-5 w-5" /> Back to Groups
            </button>

            {/* Replaced hardcoded bg-gray-800 with theme-aware bg-base-200 */}
            <div className="bg-base-200 p-6 rounded-lg shadow-xl mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        {/* Replaced hardcoded text-white with theme-aware text-base-content */}
                        <h2 className="text-4xl font-bold text-base-content mb-2 flex items-center gap-3">
                            <MdGroup className="h-8 w-8 text-primary" />
                            {currentFamilyGroup.name}
                        </h2>
                        {/* Replaced hardcoded text-gray-400 with theme-aware text-base-content opacity */}
                        <p className="text-base-content opacity-70 text-lg">
                            {currentFamilyGroup.description || 'No description provided.'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            // Replaced hardcoded text/bg colors with semantic DaisyUI classes
                            onClick={handleEditGroup}
                            className="btn btn-sm btn-outline btn-info"
                        >
                            <MdEdit /> Edit Group
                        </button>
                        <button
                            // Replaced hardcoded text/bg colors with semantic DaisyUI classes
                            onClick={handleDeleteGroup}
                            className="btn btn-sm btn-outline btn-error"
                        >
                            <MdDelete /> Delete Group
                        </button>
                    </div>
                </div>

                {/* Invite Member Section */}
                {/* Replaced hardcoded bg-gray-700 with theme-aware bg-base-100 */}
                <div className="mt-8 p-4 bg-base-100 rounded-lg">
                    {/* Replaced hardcoded text-white with theme-aware text-base-content */}
                    <h3 className="text-2xl font-semibold text-base-content mb-4 flex items-center gap-2">
                        <MdPersonAdd className="h-6 w-6" /> Invite New Member
                    </h3>
                    <form onSubmit={handleInviteSubmit} className="flex gap-3">
                        <input
                            type="email"
                            placeholder="Enter member's email"
                            // Replaced hardcoded bg-gray-800, text-gray-100, and placeholder-gray-500
                            // with theme-aware input classes
                            className="input input-bordered flex-1"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            required
                            disabled={isInviting}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary text-primary-content"
                            disabled={isInviting}
                        >
                            {isInviting ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                <>
                                    <MdPersonAdd className="h-5 w-5" /> Invite
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Members List */}
                <div className="mt-8">
                    {/* Replaced hardcoded text-white with theme-aware text-base-content */}
                    <h3 className="text-2xl font-semibold text-base-content mb-4 flex items-center gap-2">
                        <MdGroup className="h-6 w-6" /> Group Members ({currentFamilyGroup.members?.length || 0})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {currentFamilyGroup.members && currentFamilyGroup.members.length > 0 ? (
                            currentFamilyGroup.members.map(member => (
                                // Replaced hardcoded bg-gray-700 with theme-aware bg-base-100
                                <div key={member._id} className="flex items-center bg-base-100 p-4 rounded-lg shadow">
                                    <div className="avatar placeholder mr-3">
                                        <div className="bg-primary text-primary-content rounded-full w-10 h-10 flex items-center justify-center">
                                            <span className="text-lg font-bold">
                                                {member.username ? member.username[0].toUpperCase() : '?'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        {/* Replaced hardcoded text-white with theme-aware text-base-content */}
                                        <p className="text-lg font-medium text-base-content">{member.username}</p>
                                        {/* Replaced hardcoded text-gray-400 with theme-aware text-base-content opacity */}
                                        <p className="text-sm text-base-content opacity-70">{member.email}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveMember(member._id)}
                                        // Replaced hardcoded red colors with semantic btn-error
                                        className="btn btn-circle btn-ghost btn-sm ml-auto text-error"
                                        title="Remove member"
                                    >
                                        <MdDelete className="h-5 w-5" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            // Replaced hardcoded text-gray-400 with theme-aware text-base-content opacity
                            <p className="text-base-content opacity-70 col-span-full">No members in this group yet. Invite some!</p>
                        )}
                    </div>
                </div>

                {/* Associated Family Tree Section */}
                {/* Replaced hardcoded bg-gray-700 with theme-aware bg-base-100 */}
                <div className="mt-8 bg-base-100 p-6 rounded-lg shadow">
                    {/* Replaced hardcoded text-white with theme-aware text-base-content */}
                    <h3 className="text-2xl font-semibold text-base-content mb-4 flex items-center gap-2">
                        <MdAccountTree className="h-6 w-6 text-accent" /> Associated Family Tree
                    </h3>
                    {isLoadingMembers ? (
                        // Replaced hardcoded text-gray-400 with theme-aware text-base-content opacity
                        <div className="p-4 text-base-content opacity-70 flex items-center justify-center">
                            <span className="loading loading-spinner loading-sm mr-2"></span> Loading family tree members...
                        </div>
                    ) : membersError ? (
                        // Replaced hardcoded text-red-400 with theme-aware text-error
                        <div className="p-4 text-error">Error loading tree: {membersError}</div>
                    ) : familyMembersInGroup.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {/* Replaced hardcoded text-gray-400 with theme-aware text-base-content opacity */}
                            <p className="text-base-content opacity-70">
                                This group has **{familyMembersInGroup.length}** family members in its tree.
                            </p>
                            <button
                                onClick={navigateToGroupTree}
                                className="btn btn-primary text-primary-content self-start"
                            >
                                View Family Tree
                            </button>
                            {/* Replaced hardcoded text-gray-500 with theme-aware text-base-content opacity */}
                            <p className="text-sm text-base-content opacity-50 mt-2">
                                (Click "View Family Tree" to see all members linked to this group.)
                            </p>
                        </div>
                    ) : (
                        <div className="mt-4">
                            {/* Replaced hardcoded text-gray-400 with theme-aware text-base-content opacity */}
                            <p className="text-base-content opacity-70 mb-4">
                                No family tree members are associated with this group yet.
                            </p>
                            <button
                                onClick={handleOpenAddMemberModal}
                                className="btn btn-secondary text-secondary-content"
                            >
                                Create First Tree Member
                            </button>
                            {/* Replaced hardcoded text-gray-500 with theme-aware text-base-content opacity */}
                            <p className="text-sm text-base-content opacity-50 mt-2">
                                (Start building your group's family tree by adding the first member.)
                            </p>
                        </div>
                    )}
                </div>

                {/* MODIFIED: This entire placeholder div is now replaced by the new component */}
                <GroupPhotoAlbums groupId={groupId} groupName={currentFamilyGroup.name} />
            </div>

            {/* Modal for adding new family members directly from this page */}
            <Modal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                title="Add New Family Member to Group"
            >
                <AddEditMemberForm
                    onClose={() => setIsAddMemberModalOpen(false)}
                    onMemberAdded={handleMemberAddedOrEdited}
                    familyMap={familyMembersInGroup}
                    canEdit={true}
                    associatedGroup={groupId}
                />
            </Modal>
        </div>
    );
}

export default FamilyGroupDetailsContent;
