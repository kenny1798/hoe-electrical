module.exports = (sequelize, DataTypes) => {
    const push_subscription = sequelize.define("push_subscription", {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      device_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      device_fingerprint: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      endpoint: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      auth_key: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      p256dh_key: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    }, {
      tableName: 'push_subscriptions',
      timestamps: true,
    });
  
    return push_subscription;
  };
  