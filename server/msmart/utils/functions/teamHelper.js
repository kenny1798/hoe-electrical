// File: utils/teamHelper.js

const { msmart_teamManager } = require('../../models'); // Pastikan path ke models betul

/**
 * Mendapatkan semua ahli pasukan dalam hierarki secara rekursif.
 * @param {string} managerUsername - Username manager untuk mula mencari.
 * @param {number} teamId - ID pasukan.
 * @returns {Promise<Array>} - Senarai objek ahli pasukan dalam hierarki.
 */
const getTeamHierarchy = async (managerUsername, teamId) => {
    // 1. Cari ahli yang direct bawah manager
    const directMembers = await msmart_teamManager.findAll({
        where: {
            teamId: teamId,
            managerUsername: managerUsername,
        },
    });

    // Kalau tak ada, pulangkan array kosong
    if (!directMembers.length) {
        return [];
    }

    // 2. Secara rekursif, cari ahli bawah setiap direct member tadi
    const nestedMembersPromises = directMembers.map(member =>
        getTeamHierarchy(member.username, teamId) // Panggil balik fungsi ni untuk setiap ahli
    );

    // 3. Gabungkan semua hasil
    const nestedMembers = (await Promise.all(nestedMembersPromises)).flat();
    
    // 4. Pulangkan gabungan ahli direct dan ahli bawahannya
    return [...directMembers, ...nestedMembers];
};

module.exports = { getTeamHierarchy };