// frontend/src/pages/FamilyGroupsPage.jsx

import React, { useEffect, useState } from 'react';
import { useMatch, useNavigate, useParams } from 'react-router-dom'; // Import useParams
import useFamilyGroupStore from '../store/useFamilyGroupStore';
import CreateFamilyGroupModal from '../components/familyGroups/CreateFamilyGroupModal';
import FamilyGroupCard from '../components/familyGroups/FamilyGroupCard';
import { MdAdd } from 'react-icons/md';
// Toaster should ideally be in App.jsx for global toasts, but keeping it here if you prefer
import { Toaster } from 'react-hot-toast';
import FamilyGroupDetailsContent from '../components/familyGroups/FamilyGroupDetailsContent'; // Import the new details component
import FamilyTreeContent from '../components/familyGroups/FamilyTreeContent';

function FamilyGroupsPage() {
    // Get groupId from URL parameters. If present, it means we're on a details page.
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { myFamilyGroups, isLoadingGroups, groupsError, fetchMyFamilyGroups } = useFamilyGroupStore();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const isTreePath = useMatch("/family-groups/:groupId/tree");

    useEffect(() => {
        // Only fetch the list of groups if we are NOT on a specific group's details page.
        // If groupId is present, FamilyGroupDetailsContent will handle its own data fetching.
        if (!groupId) {
            fetchMyFamilyGroups();
        }
    }, [fetchMyFamilyGroups, groupId]); // Add groupId to dependencies

    const handleCardClick = (id) => {
        // Navigate to the specific group's URL. This will cause FamilyGroupsPage to re-render
        // and its `groupId` param to be set, triggering the conditional rendering of details content.
        navigate(`/family-groups/${id}`);
    };

    // if we are on the family tree path, render the tree component
    if (isTreePath && groupId) {
        return <FamilyTreeContent groupId={groupId} />
    }

    // Conditional rendering: If groupId is in the URL, render the details content
    if (groupId) {
        return <FamilyGroupDetailsContent groupId={groupId} />;
    }


    // Otherwise, render the list of family groups
    if (isLoadingGroups) {
        return (
            // Replaced hardcoded text-gray-300 with theme-aware text-base-content
            <div className="p-8 text-center text-base-content flex-1 flex items-center justify-center min-h-[50vh]">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="mt-2">Loading family groups...</p>
            </div>
        );
    }

    if (groupsError) {
        return (
            // Replaced hardcoded text-red-400 with theme-aware text-error
            <div className="p-8 text-center text-error flex-1 flex flex-col items-center justify-center min-h-[50vh]">
                <h2 className="text-2xl font-bold mb-4">Error!</h2>
                <p>{groupsError}</p>
                <p>Please try again or ensure your backend server is running.</p>
                <button
                    onClick={fetchMyFamilyGroups}
                    className="btn btn-secondary mt-4"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        // Replaced hardcoded text-gray-300 with theme-aware text-base-content
        <div className="p-8 text-base-content w-full">
            <Toaster /> {/* Toaster should ideally be in App.jsx for global toasts */}
            <div className="flex justify-between items-center mb-6 mt-4">
                {/* Replaced hardcoded text-white with theme-aware text-base-content */}
                <h2 className="text-3xl font-bold text-base-content">My Family Groups</h2>
                <button
                    className="btn btn-primary text-primary-content rounded-md hover:shadow-xl transition-all duration-200 mt-4"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    <MdAdd className="h-5 w-5" />
                    Create New Group
                </button>
            </div>

            {myFamilyGroups.length === 0 ? (
                // Replaced hardcoded bg-gray-700 with theme-aware bg-base-200
                <div className="text-center p-10 bg-base-200 rounded-lg">
                    {/* Replaced hardcoded gray text colors with theme-aware text-base-content */}
                    <p className="text-xl text-base-content opacity-70">You haven't created or joined any family groups yet.</p>
                    <p className="text-md text-base-content opacity-50 mt-2">Start by creating a new group!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {myFamilyGroups.map(group => (
                        <FamilyGroupCard
                            key={group._id}
                            group={group}
                            onClick={() => handleCardClick(group._id)}
                        />
                    ))}
                </div>
            )}

            <CreateFamilyGroupModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                // Assuming CreateFamilyGroupModal has an onGroupCreated prop to re-fetch the list
                onGroupCreated={() => fetchMyFamilyGroups()}
            />
        </div>
    );
}

export default FamilyGroupsPage;
