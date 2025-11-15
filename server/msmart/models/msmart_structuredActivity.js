module.exports = (sequelize, DataTypes) => {
    const msmart_structuredActivity = sequelize.define("msmart_structuredActivity", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      msmartleadId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      actionType: {
        type: DataTypes.STRING, // 'add' | 'edit'
        allowNull: false,
      },
      statusBefore: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      statusAfter: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      followUpDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      remarkChange: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      }
    }, {
      tableName: 'msmart_structuredActivity',
      timestamps: true, // will include createdAt & updatedAt
    });
  
    return msmart_structuredActivity;
  };