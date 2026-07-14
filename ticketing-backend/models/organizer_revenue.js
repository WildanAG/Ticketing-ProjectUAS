const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('organizer_revenue', {
    revenue_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    total_revenue: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    current_revenue: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bank_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    bank_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bank_holder_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'user_id'
      }
    }
  }, {
    sequelize,
    tableName: 'organizer_revenue',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "revenue_id" },
        ]
      },
      {
        name: "FK_revenue",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
};
