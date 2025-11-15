module.exports = (sequelize, DataTypes) => {
    const mu_progress = sequelize.define("mu_progress", {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        shortlink: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        currentLesson: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });

    return mu_progress
   };