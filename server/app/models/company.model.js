module.exports = (sequelize, Sequelize) => {
  const Company = sequelize.define('companies', {
    name: {
      type: Sequelize.STRING
    },
    domain: {
      type: Sequelize.STRING
    },
    createdAt: {
      type: 'TIMESTAMP',
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    },
    updatedAt: {
      type: 'TIMESTAMP',
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    }
  });

  return Company;
};
