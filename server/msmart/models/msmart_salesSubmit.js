module.exports = (sequelize, DataTypes) => {
    const msmart_salesSubmit = sequelize.define("msmart_salesSubmit", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      msmartleadId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Optional: kalau nak link ke table leads
      },
      repeatAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    });
  
    return msmart_salesSubmit;
  };
  