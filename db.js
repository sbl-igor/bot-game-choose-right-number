const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
     'telega_db',
     'root',
     'rootpass',
     {
        host: '82.202.198.242',
        port: '5432',
        dialect: 'postgres',
     }
)