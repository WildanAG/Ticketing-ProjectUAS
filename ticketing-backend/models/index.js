const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // sesuaikan path ke config database kamu

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// // Import model user dan daftarkan dengan nama 'User' (PascalCase)
// db.User = require('./user')(sequelize, DataTypes);

// // Import model events
// db.Event = require('./events')(sequelize, DataTypes);

// // Import model ticket
// db.Ticket = require('./ticket')(sequelize, DataTypes);

// // Jika nanti ada model lain, tinggal tambahkan di sini:
// // db.Organizer = require('./organizer')(sequelize, DataTypes);

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.User        = require('./user')(sequelize, DataTypes);
db.Event       = require('./events')(sequelize, DataTypes);
db.Ticket      = require('./ticket')(sequelize, DataTypes);
db.Transaction = require('./transaction')(sequelize, DataTypes);

// ─── Associations ─────────────────────────────────────────────────────────────
// Event ↔ Ticket
db.Event.hasMany(db.Ticket,       { foreignKey: 'event_id', as: 'tickets' });
db.Ticket.belongsTo(db.Event,     { foreignKey: 'event_id', as: 'event' });

// Ticket ↔ Transaction
db.Ticket.hasMany(db.Transaction,      { foreignKey: 'ticket_id', as: 'transactions' });
db.Transaction.belongsTo(db.Ticket,    { foreignKey: 'ticket_id', as: 'ticket' });

// User ↔ Transaction
db.User.hasMany(db.Transaction,        { foreignKey: 'user_id', as: 'transactions' });
db.Transaction.belongsTo(db.User,      { foreignKey: 'user_id', as: 'user' });

// User ↔ Event (Organizer)
db.User.hasMany(db.Event,              { foreignKey: 'user_id', as: 'events' });
db.Event.belongsTo(db.User,            { foreignKey: 'user_id', as: 'organizer' });

module.exports = db;
