module.exports = (sequelize, DataTypes) => {
    const msmart_leadForm = sequelize.define('msmart_leadForm', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false
      },
      teamId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      formTitle: {
        type: DataTypes.STRING,
        allowNull: false
      },
      formDescription: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      formImage: {
        type: DataTypes.STRING,
        allowNull: true
      },
      formTheme: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      customUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          is: /^[a-z0-9\-]+$/i  // hanya huruf, nombor, dash
        }
      },
      formConfig: {
        type: DataTypes.JSON,
        allowNull: false
      },
      enabledThankYouPage: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      thankYouPageMessage: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      enabledRedirect: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      redirectUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrlOrEmpty(value) {
            if (value && value.trim() !== "") {
              const urlRegex = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;
              if (!urlRegex.test(value)) {
                throw new Error("Must be a valid URL starting with http:// or https://");
              }
            }
          },
        },
      },
      isAutoRedirect: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isScoringForm:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      pixelMeta: {
        type: DataTypes.STRING,
        allowNull: true
      },
      pixelTiktok: {
        type: DataTypes.STRING,
        allowNull: true
      },
      pixelGoogleAds: {
        type: DataTypes.STRING,
        allowNull: true
      },
      desc:{
        type: DataTypes.JSON,
        allowNull: true
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    return msmart_leadForm;
  };
  