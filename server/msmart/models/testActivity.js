module.exports = (sequelize, DataTypes) => {
    const testActivity = sequelize.define("testActivity", {
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

    return testActivity
   };