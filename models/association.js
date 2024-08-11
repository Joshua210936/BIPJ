const Customer = require('./customer');
const { Test } = require('./test');
const QuizResult = require('./quizResult');

// Define associations
Customer.hasMany(QuizResult, { foreignKey: 'Customer_id' });
QuizResult.belongsTo(Customer, { foreignKey: 'Customer_id' });

Test.hasMany(QuizResult, { foreignKey: 'testID', as: 'Test' });
QuizResult.belongsTo(Test, { foreignKey: 'testID' });