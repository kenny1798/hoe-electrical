module.exports = (sequelize, DataTypes) => {
    const msmart_teamManager = sequelize.define("msmart_teamManager", {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nameInTeam: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        teamId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        managerName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        managerUsername: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        position: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    })

    return msmart_teamManager
   };