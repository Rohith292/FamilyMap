// frontend/src/components/familyGroups/FamilyGroupCard.jsx
import React from 'react';
import { MdGroup, MdArrowForward } from 'react-icons/md'; // Icons for group and navigation

function FamilyGroupCard({ group, onClick }) {
    return (
        <div
            // Replaced hardcoded bg-gray-800 with theme-aware card bg-base-200
            className="card bg-base-200 shadow-xl cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-lg overflow-hidden"
            onClick={() => onClick(group._id)}
        >
            <div className="card-body p-6">
                <div className="flex items-center mb-4">
                    {/* The text-primary color is theme-aware, so it's fine */}
                    <MdGroup className="text-primary text-3xl mr-3" />
                    {/* Replaced hardcoded text-white with theme-aware text-base-content */}
                    <h3 className="card-title text-xl text-base-content truncate">{group.name}</h3>
                </div>
                {/* Replaced hardcoded text-gray-400 with theme-aware text-base-content opacity */}
                <p className="text-base-content opacity-70 text-sm mb-4 line-clamp-2">
                    {group.description || 'No description provided.'}
                </p>
                {/* Replaced hardcoded text-gray-500 with theme-aware text-base-content opacity */}
                <div className="flex justify-between items-center text-base-content opacity-50 text-xs">
                    {/* Placeholder for member count */}
                    <span>Members: {group.members ? group.members.length : '...'}</span>
                    <button
                        // Removed hardcoded text-primary-focus as btn-ghost handles it
                        className="btn btn-ghost btn-sm"
                    >
                        View Details <MdArrowForward className="ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FamilyGroupCard;
