module.exports = (sequelize, DataTypes) => {
    const mu_course = sequelize.define("mu_course", {
        courseName: {
            type: DataTypes.STRING(1000),
            allowNull: false,
        },
        shortlink: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        logoFile: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        chapterCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        hasAssessment: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        hasScript: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        vidCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        teamId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }

    });

    return mu_course
   };