<template>
    <div id="report" style="width: 100%">
        <el-form label-width="200px" size="mini">
            <el-row>
                <el-col :span="12">
                    <el-form-item label="脚本自动运行间隔（分钟）：">
                        <el-input type="number" v-model.number="scriptRate"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item style="text-align: left">
                        <el-button type="primary" icon="el-icon-check" @click="editScriptRate"></el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <hr>
        <br>
        <el-form label-width="90px" size="mini">
            <el-form-item label="状态：">
                <el-select clearable v-model="script.state">
                    <el-option label="成功" value="成功"></el-option>
                    <el-option label="失败" value="失败"></el-option>
                </el-select>
            </el-form-item>

            <el-row>
                <el-col :span="12">
                    <el-form-item label="开始时间：">
                        <el-col :span="11">
                            <el-date-picker type="date" placeholder="起始日期" v-model="script.startTimeGte"
                                            value-format="yyyy-MM-dd" style="width: 100%"></el-date-picker>
                        </el-col>
                        <el-col style="text-align: center" :span="2">-</el-col>
                        <el-col :span="11">
                            <el-date-picker type="date" placeholder="结束日期" v-model="script.startTimeLte"
                                            value-format="yyyy-MM-dd" style="width: 100%"></el-date-picker>
                        </el-col>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="结束时间：">
                        <el-col :span="11">
                            <el-date-picker type="date" placeholder="起始日期" v-model="script.endTimeGte"
                                            value-format="yyyy-MM-dd" style="width: 100%"></el-date-picker>
                        </el-col>
                        <el-col style="text-align: center" :span="2">-</el-col>
                        <el-col :span="11">
                            <el-date-picker type="date" placeholder="结束日期" v-model="script.endTimeLte"
                                            value-format="yyyy-MM-dd" style="width: 100%"></el-date-picker>
                        </el-col>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-form-item style="text-align: center">
                <el-button type="primary" icon="el-icon-search" @click="search"></el-button>
                <el-button type="warning" icon="el-icon-delete" @click="script = {}"></el-button>
                <el-button type="primary" icon="el-icon-download" @click="download"></el-button>
                <el-button type="success" icon="el-icon-refresh" @click="runScript1"></el-button>
            </el-form-item>
        </el-form>

        <el-table :data="scripts" style="width: 100%;" border height="500">
            <el-table-column prop="state" label="状态"></el-table-column>
            <el-table-column prop="startTime" label="开始时间"></el-table-column>
            <el-table-column prop="endTime" label="结束时间"></el-table-column>
        </el-table>
        <el-pagination background layout="prev, pager, next" style="text-align: center; margin-top: 10px"
                       :current-page.sync="currentPage" :page-size="pageSize" :total="total"
                       @current-change="pageChange">
        </el-pagination>
    </div>
</template>

<script>
    import Sequelize from '../config/sequelize'
    import {parseScript, convertScriptsToExcelBuffer} from '../utils/util'
    import fs from 'fs'
    import path from 'path'

    export default {
        name: "Script",
        data() {
            return {
                currentPage: 1,
                pageSize: 8,
                total: 0,
                scripts: [],
                script: {},
                scriptBak: {},
                scriptRate: 30
            }
        },
        methods: {
            runScript1() {
                this.$electron.ipcRenderer.send('runScript')
            },
            editScriptRate() {
                fs.readFile(path.resolve(this.$electron.remote.app.getPath('userData'), './config.json'), 'utf8', (err, data) => {
                    if (err) throw err
                    let config = JSON.parse(data)
                    config['scriptRate'] = this.scriptRate
                    fs.writeFile(path.resolve(this.$electron.remote.app.getPath('userData'), './config.json'),
                        JSON.stringify(config), 'utf8',
                        err => {
                            if (err) throw err
                            this.$electron.ipcRenderer.send('scriptRateUpdate')
                        })
                })
            },
            download() {
                this.$electron.remote.dialog.showSaveDialog({
                    filters: [{name: 'Excel 工作簿', extensions: ['xlsx']}]
                }, (filename) => {
                    if (filename) {
                        Sequelize.Script.findAll({
                            where: parseScript(this.scriptBak),
                            order: [['id', 'DESC']]
                        }).then(scripts => fs.writeFileSync(filename, convertScriptsToExcelBuffer(scripts))).catch(err => {
                            throw err
                        })
                    }
                })
            },
            search() {
                this.currentPage = 1
                this.scriptBak = JSON.parse(JSON.stringify(this.script))
                Sequelize.Script.count({where: parseScript(this.script)}).then(count => this.total = count).catch(err => {
                    throw err
                })
                Sequelize.Script.findAll({
                    limit: this.pageSize,
                    offset: this.pageSize * this.currentPage - this.pageSize,
                    where: parseScript(this.script),
                    order: [['id', 'DESC']]
                }).then(scripts => this.scripts = scripts).catch(err => {
                    throw err
                })
            },
            pageChange() {
                Sequelize.Script.findAll({
                    limit: this.pageSize,
                    offset: this.pageSize * this.currentPage - this.pageSize,
                    where: parseScript(this.scriptBak),
                    order: [['id', 'DESC']]
                }).then(scripts => this.scripts = scripts).catch(err => {
                    throw err
                })
            }
        },
        mounted() {
            this.search()
            fs.readFile(path.resolve(this.$electron.remote.app.getPath('userData'), './config.json'), 'utf8', (err, data) => {
                if (err) throw err
                this.scriptRate = JSON.parse(data)['scriptRate']
            })
        }
    }
</script>
