const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ticket', {
    ticket_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ticket_category: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    ticket_quota: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    current_price: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    base_price: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ticket_sold: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'events',
        key: 'event_id'
      }
    }
  }, {
    sequelize,
    tableName: 'ticket',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ticket_id" },
        ]
      },
      {
        name: "FK_event",
        using: "BTREE",
        fields: [
          { name: "event_id" },
        ]
      },
    ]
  });
};
