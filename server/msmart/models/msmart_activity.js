module.exports = (sequelize, DataTypes) => {
    const msmart_activity = sequelize.define("msmart_activity", {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        teamId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        activity:{
            type: DataTypes.STRING,
            allowNull: false,
        }


    })

    return msmart_activity
   };