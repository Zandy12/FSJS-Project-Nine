'use strict'
const Sequelize = require('sequelize');

// Course properties: title, description, estimatedTime, materialsNeeded
module.exports = (sequelize) => {
    class Course extends Sequelize.Model {}
    Course.init({
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Please provide a value for "userId"',
                },
                notEmpty: {
                    msg: 'Please provide a value for "userId"',                    
                },
            },
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Please provide a value for "Title"',
                },
                notEmpty: {
                    msg: 'Please provide a value for "Title"',                    
                },
            },
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Please provide a value for "Description"',
                },
                notEmpty: {
                    msg: 'Please provide a value for "Description"',                    
                },
            },
        },
        estimatedTime: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        materialsNeeded: {
            type: Sequelize.STRING,
            allowNull: true,
        },
    }, { sequelize });

    // Course has a .belongsTo() to give each course one rightful owner as User
    Course.associate = (models) => {
        Course.belongsTo(models.User, {
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

    return Course;
} 