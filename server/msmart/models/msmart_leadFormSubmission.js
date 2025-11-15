module.exports = (sequelize, DataTypes) => {
    const msmart_leadFormSubmission = sequelize.define('msmart_leadFormSubmission', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      msmartleadId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      formId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      answers: {
        type: DataTypes.JSON,
        allowNull: true
      },
      desc: {
        type: DataTypes.JSON,
        allowNull: true
      },
      submittedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  
    return msmart_leadFormSubmission;
  };
  