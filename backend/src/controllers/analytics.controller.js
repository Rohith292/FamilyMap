// backend/controllers/analyticsController.js

import FamilyMember from '../models/family.model.js';
import FamilyGroup from '../models/familyGroup.model.js';
import Album from '../models/album.model.js';
import mongoose from 'mongoose';
import nlp from 'compromise';

// Helper function to check if a user is a member of any family group
const isUserInGroup = async (userId, groupId) => {
    if (!mongoose.Types.ObjectId.isValid(groupId)) return false;
    const group = await FamilyGroup.findById(groupId);
    if (!group) return false;
    return group.members.some(memberId => memberId.toString() === userId.toString());
};

const handleChatQuery = async (req, res) => {
    const { query } = req.body;
    const userId = req.user._id;

    if (!query) {
        return res.status(400).json({ error: 'Query is required.' });
    }

    try {
        const lowerCaseQuery = query.toLowerCase();
        const doc = nlp(lowerCaseQuery);
        let response = null;

        // --- Intent-based parsing using a local NLP library ---

        // 1. Group-related queries
        if (doc.match('(group|family)').found) {
            if (doc.match('how many').found) {
                const groups = await FamilyGroup.find({ members: userId });
                response = `You are a member of ${groups.length} family group${groups.length !== 1 ? 's' : ''}.`;
            } else if (doc.match('what (groups|families)').found || doc.match('list my (groups|families)').found) {
                const groups = await FamilyGroup.find({ members: userId });
                if (groups.length > 0) {
                    const groupNames = groups.map(g => g.name).join(', ');
                    response = `You are in these groups: ${groupNames}.`;
                } else {
                    response = `You are not a member of any family groups yet.`;
                }
            }
        }

        // 2. Album-related queries
        if (!response && doc.match('(album|photo|picture)').found) {
            if (doc.match('how many').found) {
                const personalAlbumCount = await Album.countDocuments({ owner: userId });
                const groupAlbums = await FamilyGroup.find({ members: userId }).select('_id');
                const groupAlbumCount = await Album.countDocuments({ sharedWithGroups: { $in: groupAlbums.map(g => g._id) } });
                response = `You have ${personalAlbumCount} personal album${personalAlbumCount !== 1 ? 's' : ''} and are part of ${groupAlbumCount} group album${groupAlbumCount !== 1 ? 's' : ''}.`;
            } else if (doc.match('what (albums|photos|pictures)').found) {
                const personalAlbums = await Album.find({ owner: userId }).select('name');
                const userGroups = await FamilyGroup.find({ members: userId }).select('_id');
                const sharedAlbums = await Album.find({ sharedWithGroups: { $in: userGroups.map(g => g._id) } }).select('name');
                
                const allAlbumNames = [...new Set([...personalAlbums.map(a => a.name), ...sharedAlbums.map(a => a.name)])];
                if (allAlbumNames.length > 0) {
                    response = `Your albums are: ${allAlbumNames.join(', ')}.`;
                } else {
                    response = `You don't have any personal or group albums yet.`;
                }
            } else if (doc.match('what is #Noun about').found) {
                const albumName = doc.match('what is [album] about').nouns().text();
                const personalAlbum = await Album.findOne({ owner: userId, name: new RegExp(`^${albumName}$`, 'i') });
                if (personalAlbum) {
                    response = `The album "${personalAlbum.name}" is about: ${personalAlbum.description || "No description provided."}`;
                } else {
                    const userGroups = await FamilyGroup.find({ members: userId }).select('_id');
                    const sharedAlbum = await Album.findOne({ sharedWithGroups: { $in: userGroups.map(g => g._id) }, name: new RegExp(`^${albumName}$`, 'i') });
                    if (sharedAlbum) {
                        response = `The group album "${sharedAlbum.name}" is about: ${sharedAlbum.description || "No description provided."}`;
                    }
                }
            }
        }

        // 3. Family Member-related queries (Final FIXES HERE)
        if (!response) {
            let memberName = null;
            let relation = null;

            // FIX: Using simple string checks for better reliability on common queries
            if (lowerCaseQuery.includes('parents of')) {
                relation = 'parent';
                memberName = lowerCaseQuery.split('parents of')[1].trim();
            } else if (lowerCaseQuery.includes('parent of')) {
                relation = 'parent';
                memberName = lowerCaseQuery.split('parent of')[1].trim();
            } else if (lowerCaseQuery.includes('brother of')) {
                relation = 'sibling'; // Handle brother/sister under 'sibling'
                memberName = lowerCaseQuery.split('brother of')[1].trim();
            } else if (lowerCaseQuery.includes('sister of')) {
                relation = 'sibling';
                memberName = lowerCaseQuery.split('sister of')[1].trim();
            } else if (lowerCaseQuery.includes('partner of')) {
                relation = 'partner';
                memberName = lowerCaseQuery.split('partner of')[1].trim();
            } else if (lowerCaseQuery.includes('children of')) {
                relation = 'child';
                memberName = lowerCaseQuery.split('children of')[1].trim();
            } else if (lowerCaseQuery.includes('child of')) {
                relation = 'child';
                memberName = lowerCaseQuery.split('child of')[1].trim();
            } else if (lowerCaseQuery.includes('siblings of')) {
                relation = 'sibling';
                memberName = lowerCaseQuery.split('siblings of')[1].trim();
            } else if (lowerCaseQuery.includes('who is')) {
                memberName = lowerCaseQuery.split('who is')[1].trim();
            } else {
                // Fallback to the NLP library's person matching
                memberName = doc.match('#Person').text();
            }
            
            if (memberName) {
                const member = await FamilyMember.findOne({ name: new RegExp(`^${memberName}$`, 'i') });

                if (member && (member.createdBy.toString() === userId.toString() || await isUserInGroup(userId, member.associatedGroup))) {
                    if (relation) {
                        let relatedMembers = [];
                        let relationshipString = relation;
                        
                        switch (relation) {
                            case 'parent':
                                // FIX: Now correctly finding parents by checking children array
                                relatedMembers = await FamilyMember.find({ children: member._id }).select('name');
                                relationshipString = 'parent';
                                break;
                            case 'child':
                                const populatedMember = await FamilyMember.findById(member._id).populate('children', 'name');
                                relatedMembers = populatedMember ? populatedMember.children : [];
                                relationshipString = 'child';
                                break;
                            case 'sibling':
                                // FIX: More robust sibling query
                                // Find all parents of the target member
                                const parents = await FamilyMember.find({ children: member._id }).select('_id');
                                const parentIds = parents.map(p => p._id);
                                if (parentIds.length > 0) {
                                     // Find all members who are also children of those same parents, excluding the target member
                                     const siblings = await FamilyMember.find({ parents: { $in: parentIds }, _id: { $ne: member._id }}).select('name');
                                     relatedMembers = siblings;
                                }
                                relationshipString = 'sibling';
                                break;
                            case 'partner':
                                const memberWithPartners = await FamilyMember.findById(member._id).populate('partners', 'name');
                                relatedMembers = memberWithPartners ? memberWithPartners.partners : [];
                                relationshipString = 'partner';
                                break;
                        }

                        if (relatedMembers.length > 0) {
                            const names = relatedMembers.map(m => m.name).join(' and ');
                            response = `${member.name}'s ${relationshipString}${relatedMembers.length > 1 ? 's are' : ' is'} ${names}.`;
                        } else {
                            response = `${member.name} has no ${relationshipString}s listed.`;
                        }
                    } else { // This is for "who is [person]" queries
                        const parents = await FamilyMember.find({ children: member._id }).select('name');
                        const partners = await FamilyMember.findById(member._id).populate('partners', 'name');
                        let memberResponse = `${member.name} is a member of your family tree.`;
                        if (parents.length > 0) {
                            memberResponse += ` ${member.name}'s parent${parents.length > 1 ? 's are' : ' is'} ${parents.map(p => p.name).join(' and ')}.`;
                        }
                        if (partners && partners.partners.length > 0) {
                            memberResponse += ` ${member.name}'s partner${partners.partners.length > 1 ? 's are' : ' is'} ${partners.partners.map(p => p.name).join(' and ')}.`;
                        }
                        response = memberResponse;
                    }
                } else {
                    response = `I couldn't find anyone named ${memberName} in your family tree.`;
                }
            }
        }
        
        // Final fallback if no rules matched
        if (!response) {
            response = "I'm sorry, I couldn't find an answer to that question. Please try rephrasing it.";
        }

        res.status(200).json({ response });

    } catch (error) {
        console.error('Chatbot API Error:', error);
        res.status(500).json({ error: 'An internal error occurred while processing your request.' });
    }
};

export { handleChatQuery };