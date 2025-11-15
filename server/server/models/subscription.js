module.exports = (sequelize, DataTypes) => {
    const subscription = sequelize.define("subscription", {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        subsItem: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        subsType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        subsPeriod: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },

    });

    return subscription
   };