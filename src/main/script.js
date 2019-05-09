import fs from 'fs'
import path from 'path'
import {app, BrowserWindow} from 'electron'
import request from 'superagent'
import cheerio from 'cheerio'
import xlsx from 'node-xlsx'
import Sequelize from '../renderer/config/sequelize'
import moment from 'moment'

let configPath = path.resolve(app.getPath('userData'), './config.json')

let createConfigIfNotExist = () => {
    if (!fs.existsSync(configPath)) {
        let config = {
            'scriptRate': 30,
            'saleStock': 50,
            'removedStock': 50,
            'login': {
                'account': '3308715151@qq.com',
                'password': 'zhiying123'
            },
            'download': {
                'filepath': path.resolve(app.getPath('userData'), './product.xlsx')
            }
        }
        fs.writeFileSync(configPath, JSON.stringify(config), 'utf8')
    }
}

async function runScript() {
    let currentBatchNo = moment().format("YYYYMMDDHHmmss")
    let startTime = moment().format("YYYY-MM-DD HH:mm:ss")
    await download().then(() => {
        let filepath = getConfig('download', 'filepath')
        let data = xlsx.parse(filepath)[0]['data']
        let tmp = data.map(value => {
            return {
                sku: value[0],
                name: value[1],
                price: value[2].substr(2) * 1,
                stock: value[3] * 1,
                purchase: value[4],
                clearance: value[5],
                tort: value[6],
                information: value[7],
                state: value[8],
                updateTime: moment(value[11], "YYYY/M/D HH:mm:ss").format("YYYY-MM-DD HH:mm:ss"),
                batchNo: currentBatchNo
            }
        }).filter(value => {
            return !isNaN(value['stock'])
        })
        Sequelize.Product.bulkCreate(tmp).then(() => {
            Sequelize.Script.create({
                startTime: startTime,
                endTime: moment().format("YYYY-MM-DD HH:mm:ss"),
                state: '成功'
            }).then(() => {
                BrowserWindow.getFocusedWindow().webContents.send('runScriptComplete')
            })
        }).catch(err => {
            Sequelize.Script.create({
                startTime: startTime,
                endTime: moment().format("YYYY-MM-DD HH:mm:ss"),
                state: '失败'
            }).then(() => {
                BrowserWindow.getFocusedWindow().webContents.send('runScriptComplete')
            })
            return Promise.reject(err)
        })
    }).catch(err => {
        Sequelize.Script.create({
            startTime: startTime,
            endTime: moment().format("YYYY-MM-DD HH:mm:ss"),
            state: '失败'
        }).then(() => {
            BrowserWindow.getFocusedWindow().webContents.send('runScriptComplete')
        })
        return Promise.reject(err)
    })
}

let scriptRate = 30
let timer = null
let setScript = () => {
    scriptRate = JSON.parse(fs.readFileSync(configPath, 'utf8'))['scriptRate']
    timer = setInterval(() => runScript(), scriptRate * 60 * 1000)
}

export {createConfigIfNotExist, timer, setScript, runScript}

function getConfig(section, key) {
    let file = path.resolve(__dirname, configPath);
    let data = fs.readFileSync(file, 'utf-8');
    let config = JSON.parse(data);
    return config[section][key]
}

async function download() {
    let agent = request.agent()
    let account = getConfig('login', 'account')
    let password = getConfig('login', 'password')
    let token = ''
    await agent // get __RequestVerificationToken
        .get('https://www.goten.com/login.html')
        .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8')
        .set('Accept-Encoding', 'gzip, deflate, br')
        .set('Accept-Language', 'en-US,en;q=0.9')
        .set('Cache-Control', 'max-age=0')
        .set('Connection', 'keep-alive')
        .set('Host', 'www.goten.com')
        .set('Upgrade-Insecure-Requests', '1')
        .set('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36')
        .then(res => {
            let $ = cheerio.load(res.text)
            token = $('input[name="__RequestVerificationToken"]').val()
        })
        .catch(err => {
            return Promise.reject(err)
        })
    await agent // login
        .post('https://www.goten.com/login.html')
        .send({
            __RequestVerificationToken: token,
            AccountName: account,
            Password: password,
            valiCode: ''
        })
        .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8')
        .set('Accept-Encoding', 'gzip, deflate, br')
        .set('Accept-Language', 'en-US,en;q=0.9')
        .set('Cache-Control', 'max-age=0')
        .set('Connection', 'keep-alive')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Origin', 'https://www.goten.com')
        .set('Referer', 'https://www.goten.com/login.html')
        .set('Upgrade-Insecure-Requests', '1')
        .set('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36')
        .then(res => {
        })
        .catch(err => {
            return Promise.reject(err)
        })
    let filepath = getConfig('download', 'filepath')
    let stream = fs.createWriteStream(filepath)
    await new Promise(resolve =>
        agent // download
            .post('https://www.goten.com/Product/ExportDataAll')
            .send({type: '1'})
            .set('Host', 'www.goten.com')
            .set('Connection', 'keep-alive')
            .set('Content-Length', '6')
            .set('Cache-Control', 'max-age=0')
            .set('Origin', 'https://www.goten.com')
            .set('Upgrade-Insecure-Requests', '1')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .set('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36')
            .set('Referer', 'https://www.goten.com/products.html?type=wish')
            .set('Accept-Encoding', 'gzip, deflate, br')
            .set('Accept-Language', 'en-US,en;q=0.9')
            .pipe(stream)
            .on('finish', resolve)
    )
}
