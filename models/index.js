// models/index.js
const User = require('./User');
const Transaction = require('./Transaction');

// link
User.hasMany(Transaction, { foreignKey: 'senderId', as: 'transactionsSent' });
User.hasMany(Transaction, { foreignKey: 'receiverId', as: 'transactionsReceived' });
Transaction.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Transaction.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

module.exports = {
  User,
  Transaction
};
