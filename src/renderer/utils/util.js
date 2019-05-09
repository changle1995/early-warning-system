import {Op} from 'sequelize'
import xlsx from 'node-xlsx'

let parseLike = (like) => {
    let data = {}
    if (like) data = {...data, ...{[Op.like]: '%' + like + '%'}}
    return data
}

let parseRange = (gte, lte) => {
    let data = {}
    if (gte) data = {...data, ...{[Op.gte]: gte}}
    if (lte) data = {...data, ...{[Op.lte]: lte}}
    return data
}

let parseIn = (inArray) => {
    if (inArray) {
        if (Array.isArray(inArray)) {
            return {[Op.in]: inArray}
        } else {
            return {[Op.in]: Array.of(inArray)}
        }
    }
    return {}
}

let deleteBlankField = (data) => {
    for (let key in data) {
        if (Object.keys(data[key]).length === 0 && Object.getOwnPropertySymbols(data[key]).length === 0) {
            delete data[key]
        }
    }
}

export let parseProduct = (product) => {
    let where = {
        id: parseIn(product.id),
        sku: parseIn(product.sku),
        name: parseLike(product.name),
        price: parseRange(product.priceGte, product.priceLte),
        stock: parseRange(product.stockGte, product.stockLte),
        purchase: parseIn(product.purchase),
        clearance: parseIn(product.clearance),
        tort: parseIn(product.tort),
        information: parseIn(product.information),
        state: parseIn(product.state),
        updateTime: parseRange(product.updateTimeGte, product.updateTimeLte),
        batchNo: parseIn(product.batchNo)
    }
    deleteBlankField(where)
    return where
}

export let convertProductsToExcelBuffer = (products) => {
    let header = [
        '批次号',
        'SKU',
        '商品名称',
        '价格',
        '库存',
        '进货',
        '清仓',
        '侵权',
        '商品资料',
        '状态',
        '更新时间'
    ]
    let data = products.map(product => {
        return [
            product.batchNo,
            product.sku,
            product.name,
            '$ ' + product.price.toFixed(2),
            product.stock,
            product.purchase,
            product.clearance,
            product.tort,
            product.information,
            product.state,
            product.updateTime
        ]
    })
    data.unshift(header)
    return xlsx.build([{name: "sheet1", data: data}])
}

export let parseScript = (script) => {
    let where = {
        id: parseIn(script.id),
        state: parseIn(script.state),
        startTime: parseRange(script.startTimeGte, script.startTimeLte),
        endTime: parseRange(script.endTimeGte, script.endTimeLte)
    }
    deleteBlankField(where)
    return where
}

export let convertScriptsToExcelBuffer = (scripts) => {
    let header = [
        '开始时间',
        '结束时间',
        '状态'
    ]
    let data = scripts.map(script => {
        return [
            script.startTime,
            script.endTime,
            script.state
        ]
    })
    data.unshift(header)
    return xlsx.build([{name: "sheet1", data: data}])
}
