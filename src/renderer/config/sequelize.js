import Sequelize from 'sequelize'
import path from 'path'

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '../../../db.db'),
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    define: {
        freezeTableName: true
    },
    logging: false
})

let Product = sequelize.define('product',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        sku: Sequelize.STRING,
        name: Sequelize.TEXT,
        price: Sequelize.FLOAT(18, 2),
        stock: Sequelize.INTEGER,
        purchase: Sequelize.STRING,
        clearance: Sequelize.STRING,
        tort: Sequelize.STRING,
        information: Sequelize.STRING,
        state: Sequelize.STRING,
        updateTime: {
            type: Sequelize.TEXT,
            field: 'update_time'
        },
        batchNo: {
            type: Sequelize.TEXT,
            field: 'batch_no'
        }
    }, {
        timestamps: false
    })

let MyProduct = sequelize.define('my_product', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sku: Sequelize.STRING,
    state: Sequelize.INTEGER
})

let Script = sequelize.define('script',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        startTime: {
            type: Sequelize.TEXT,
            field: 'start_time'
        },
        endTime: {
            type: Sequelize.TEXT,
            field: 'end_time'
        },
        state: Sequelize.STRING
    }, {
        timestamps: false
    })

export default {sequelize, Product, MyProduct, Script}
