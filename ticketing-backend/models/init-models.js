var DataTypes = require("sequelize").DataTypes;
var _events = require("./events");
var _report = require("./report");
var _ticket = require("./ticket");
var _transaction = require("./transaction");
var _user = require("./user");

function initModels(sequelize) {
  var events = _events(sequelize, DataTypes);
  var report = _report(sequelize, DataTypes);
  var ticket = _ticket(sequelize, DataTypes);
  var transaction = _transaction(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);

  report.belongsTo(events, { as: "event", foreignKey: "event_id"});
  events.hasMany(report, { as: "reports", foreignKey: "event_id"});
  ticket.belongsTo(events, { as: "event", foreignKey: "event_id"});
  events.hasMany(ticket, { as: "tickets", foreignKey: "event_id"});
  transaction.belongsTo(ticket, { as: "ticket", foreignKey: "ticket_id"});
  ticket.hasMany(transaction, { as: "transactions", foreignKey: "ticket_id"});
  events.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(events, { as: "events", foreignKey: "user_id"});
  report.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(report, { as: "reports", foreignKey: "user_id"});
  transaction.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(transaction, { as: "transactions", foreignKey: "user_id"});

  return {
    events,
    report,
    ticket,
    transaction,
    user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
