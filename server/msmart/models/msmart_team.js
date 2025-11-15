module.exports = (sequelize, DataTypes) => {
    const msmart_team = sequelize.define("msmart_team", {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        teamName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        link: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    })

    return msmart_team
   };