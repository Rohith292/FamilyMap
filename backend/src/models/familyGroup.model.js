// backend/models/FamilyGroup.js
import mongoose from "mongoose";

const familyGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Group name is required'],
        trim: true,
        unique: true // Ensure group names are unique
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    // The user who created this group, likely the "admin"
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Array of users who are members of this group
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Optional: a list of pending invitations if you implement a robust invite system
    pendingInvitations: [{
        email: { type: String, required: true },
        invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        token: { type: String, unique: true }, // For invite links
        expires: { type: Date }
    }]
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Pre-save hook to ensure the creator is always a member
familyGroupSchema.pre('save', function(next) {
    if (this.isNew && !this.members.includes(this.createdBy)) {
        this.members.push(this.createdBy);
    }
    next();
});

const FamilyGroup = mongoose.model('FamilyGroup', familyGroupSchema);
export default FamilyGroup;