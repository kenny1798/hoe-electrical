module.exports = (sequelize, DataTypes) => {
    const msmartleads = sequelize.define("msmartleads", {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        teamId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
        },
        remark: {
            type: DataTypes.STRING(1000),
        },
        followUpDate: {
            type: DataTypes.DATE,
        },
        salesAmount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        }
    });

    msmartleads.associate = (models) => {

        msmartleads.hasMany(models.msmart_activity, {
            onDelete: "cascade",
        })

    }


    return msmartleads;

    };