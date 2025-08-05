// backend/controllers/familyGroupController.js
import FamilyGroup from '../models/familyGroup.model.js';
import User from '../models/user.model.js'; // Needed to update user's familyGroups
import asyncHandler from 'express-async-handler'; // For simplifying async error handling

// @desc    Create a new family group
// @route   POST /api/family-groups
// @access  Private
const createFamilyGroup = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const createdBy = req.user._id; // Assuming req.user is populated by your auth middleware

    if (!name) {
        res.status(400);
        throw new Error('Group name is required');
    }

    const familyGroupExists = await FamilyGroup.findOne({ name });

    if (familyGroupExists) {
        res.status(400);
        throw new Error('A group with this name already exists.');
    }

    const familyGroup = new FamilyGroup({
        name,
        description,
        createdBy,
        members: [createdBy] // Creator is automatically a member
    });

    const createdFamilyGroup = await familyGroup.save();

    // Add the group to the creator's familyGroups array
    req.user.familyGroups.push(createdFamilyGroup._id);
    await req.user.save();

    res.status(201).json(createdFamilyGroup);
});

// @desc    Get all family groups a user belongs to
// @route   GET /api/family-groups/my
// @access  Private
const getMyFamilyGroups = asyncHandler(async (req, res) => {
    // req.user.familyGroups is already populated from the auth middleware or user model
    // We can also populate the members if needed, but for a list, just group name might be enough.
    const myGroups = await FamilyGroup.find({ members: req.user._id }).populate('createdBy', 'fullName email');

    res.json(myGroups);
});

// @desc    Get a specific family group by ID (and check if user is a member)
// @route   GET /api/family-groups/:id
// @access  Private
const getFamilyGroupById = asyncHandler(async (req, res) => {
    const familyGroup = await FamilyGroup.findById(req.params.id)
        .populate('members', 'fullName email profilePic') // Populate members with specific fields
        .populate('createdBy', 'fullName email'); // Populate creator

    if (!familyGroup) {
        res.status(404);
        throw new Error('Family group not found');
    }

    // Check if the requesting user is a member of this group
    const isMember = familyGroup.members.some(member => member._id.toString() === req.user._id.toString());

    if (!isMember) {
        res.status(403);
        throw new Error('Not authorized to access this family group');
    }

    res.json(familyGroup);
});

// @desc    Update a family group (e.g., name, description)
// @route   PUT /api/family-groups/:id
// @access  Private (only for group creator/admin)
const updateFamilyGroup = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const familyGroup = await FamilyGroup.findById(req.params.id);

    if (!familyGroup) {
        res.status(404);
        throw new Error('Family group not found');
    }

    // Only the creator can update the group details
    if (familyGroup.createdBy.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this family group');
    }

    familyGroup.name = name || familyGroup.name;
    familyGroup.description = description !== undefined ? description : familyGroup.description;

    const updatedFamilyGroup = await familyGroup.save();
    res.json(updatedFamilyGroup);
});


// @desc    Add a member to a family group (by email or user ID)
// @route   PUT /api/family-groups/:id/add-member
// @access  Private (only for group creator/admin)
const addMemberToFamilyGroup = asyncHandler(async (req, res) => {
    const { userIdOrEmail } = req.body; // Can be user ID or email
    const familyGroupId = req.params.id;

    const familyGroup = await FamilyGroup.findById(familyGroupId);

    if (!familyGroup) {
        res.status(404);
        throw new Error('Family group not found');
    }

    // Only the creator can add members
    if (familyGroup.createdBy.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to add members to this family group');
    }

    let targetUser;
    if (userIdOrEmail.includes('@')) { // Assume email if it contains '@'
        targetUser = await User.findOne({ email: userIdOrEmail });
    } else { // Assume it's a userId
        targetUser = await User.findById(userIdOrEmail);
    }

    if (!targetUser) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if user is already a member
    if (familyGroup.members.includes(targetUser._id)) {
        res.status(400);
        throw new Error('User is already a member of this group');
    }

    familyGroup.members.push(targetUser._id);
    await familyGroup.save();

    // Add the group to the target user's familyGroups array if not already there
    if (!targetUser.familyGroups.includes(familyGroup._id)) {
        targetUser.familyGroups.push(familyGroup._id);
        await targetUser.save();
    }

    res.json({ message: 'Member added successfully', familyGroup });
});

// @desc    Remove a member from a family group
// @route   PUT /api/family-groups/:id/remove-member
// @access  Private (only for group creator/admin)
const removeMemberFromFamilyGroup = asyncHandler(async (req, res) => {
    const { memberId } = req.body;
    const familyGroupId = req.params.id;

    const familyGroup = await FamilyGroup.findById(familyGroupId);

    if (!familyGroup) {
        res.status(404);
        throw new Error('Family group not found');
    }

    // Only the creator can remove members
    if (familyGroup.createdBy.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to remove members from this family group');
    }

    // Cannot remove the creator from the group
    if (familyGroup.createdBy.toString() === memberId.toString()) {
        res.status(400);
        throw new Error('Cannot remove the creator from the group');
    }

    // Remove member from the familyGroup's members array
    familyGroup.members = familyGroup.members.filter(
        (member) => member._id.toString() !== memberId.toString()
    );
    await familyGroup.save();

    // Remove the group from the removed user's familyGroups array
    const removedUser = await User.findById(memberId);
    if (removedUser) {
        removedUser.familyGroups = removedUser.familyGroups.filter(
            (groupId) => groupId.toString() !== familyGroup._id.toString()
        );
        await removedUser.save();
    }

    res.json({ message: 'Member removed successfully', familyGroup });
});


// @desc    Delete a family group
// @route   DELETE /api/family-groups/:id
// @access  Private (only for group creator)
const deleteFamilyGroup = asyncHandler(async (req, res) => {
    const familyGroup = await FamilyGroup.findById(req.params.id);

    if (!familyGroup) {
        res.status(404);
        throw new Error('Family group not found');
    }

    // Only the creator can delete the group
    if (familyGroup.createdBy.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this family group');
    }

    // Remove this group from all its members' familyGroups arrays
    await User.updateMany(
        { _id: { $in: familyGroup.members } },
        { $pull: { familyGroups: familyGroup._id } }
    );

    // TODO: Decide how to handle albums and family tree members associated with this group.
    // - Should associated albums become private or be deleted?
    // - What happens to family tree members whose only associatedGroup was this one?
    // For now, they will still reference the deleted group, which might lead to orphaned data.
    // This requires a more complex decision based on your app's logic.
    // For MVP, you might just enforce that groups with associated content cannot be deleted easily.

    await familyGroup.deleteOne(); // Or findByIdAndDelete()

    res.json({ message: 'Family group deleted successfully' });
});


export {
    createFamilyGroup,
    getMyFamilyGroups,
    getFamilyGroupById,
    updateFamilyGroup,
    addMemberToFamilyGroup,
    removeMemberFromFamilyGroup,
    deleteFamilyGroup,
};
