'use strict'
const Sequelize = require('sequelize');

// User properties: firstName, lastName, emailAddress, password
module.exports = (sequelize) => {
    class User extends Sequelize.Model {}
    User.init({
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        firstName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Please provide a value for "First Name"',
                },
                notEmpty: {
                    msg: 'Please provide a value for "First Name"',                    
                },
            },
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Please provide a value for "Last Name"',
                },
                notEmpty: {
                    msg: 'Please provide a value for "Last Name"',                    
                },
            },
        },
        emailAddress: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Please provide a value for "Email Address"',
                },
                notEmpty: {
                    msg: 'Please provide a value for "Email Address"',                    
                },
            },
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Please provide a value for "Password"',
                },
                notEmpty: {
                    msg: 'Please provide a value for "Password"',                    
                },
            },
        },
    }, { sequelize });

    // User has a .hasMany() to link several courses to a specific user
    User.associate = (models) => {
        User.hasMany(models.Course, {
            foreignKey: {
                fieldName: 'userId',
                allowNull: false,
                validate: {
                    notNull: {
                        msg: 'Please provide a value for "foreignKey"',
                    },
                    notEmpty: {
                        msg: 'Please provide a value for "foreignKey"',                    
                    },
                },
            },
        });
    }; 

    return User;
} 