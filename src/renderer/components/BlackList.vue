<template>
    <div id="report" style="width: 100%">
        <el-form label-width="90px" size="mini">
            <el-row>
                <el-col :span="8">
                    <el-form-item label="SKU：">
                        <el-input v-model="whiteList.sku"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="16">
                    <el-form-item label="名称：">
                        <el-input v-model="whiteList.name"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row>
                <el-col :span="12">
                    <el-form-item label="创建时间：">
                        <el-col :span="11">
                            <el-date-picker type="date" placeholder="起始日期" v-model="whiteList.createdAtGte"
                                            value-format="yyyy-MM-dd" style="width: 100%"></el-date-picker>
                        </el-col>
                        <el-col style="text-align: center" :span="2">-</el-col>
                        <el-col :span="11">
                            <el-date-picker type="date" placeholder="结束日期" v-model="whiteList.createdAtLte"
                                            value-format="yyyy-MM-dd" style="width: 100%"></el-date-picker>
                        </el-col>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="更新时间：">
                        <el-col :span="11">
                            <el-date-picker type="date" placeholder="起始日期" v-model="whiteList.updatedAtGte"
                                            value-format="yyyy-MM-dd" style="width: 100%"></el-date-picker>
                        </el-col>
                        <el-col style="text-align: center" :span="2">-</el-col>
                        <el-col :span="11">
                            <el-date-picker type="date" placeholder="结束日期" v-model="whiteList.updatedAtLte"
                                            value-format="yyyy-MM-dd" style="width: 100%"></el-date-picker>
                        </el-col>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-form-item style="text-align: center">
                <el-button type="primary" icon="el-icon-search" @click="search"></el-button>
                <el-button type="success" icon="el-icon-plus" @click="dialogFormVisible = true"></el-button>
                <el-button type="warning" icon="el-icon-delete" @click="whiteList = {}"></el-button>
                <el-button type="primary" icon="el-icon-download" @click="download"></el-button>
            </el-form-item>
        </el-form>

        <el-table :data="whiteLists" style="width: 100%;" border height="450">
            <el-table-column prop="sku" label="SKU" width="100"></el-table-column>
            <el-table-column prop="name" label="商品名称" width="350" show-overflow-tooltip></el-table-column>
            <el-table-column label="创建时间" width="160">
                <template slot-scope="scope"> {{scope.row.createdAt | dateToStr}}</template>
            </el-table-column>
            <el-table-column label="更新时间" width="160">
                <template slot-scope="scope"> {{scope.row.updatedAt | dateToStr}}</template>
            </el-table-column>
            <el-table-column label="操作" width="130">
                <template slot-scope="scope">
                    <el-button type="warning" @click="editRow(scope.row)" icon="el-icon-edit" size="mini"></el-button>
                    <el-button type="danger" @click="deleteRow(scope.row)" icon="el-icon-delete"
                               size="mini"></el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination background layout="prev, pager, next" style="text-align: center; margin-top: 10px"
                       :current-page.sync="currentPage" :page-size="pageSize" :total="total"
                       @current-change="pageChange">
        </el-pagination>

        <el-dialog @close="dialogFormVisible = false;dialogForm = {}" title="添加白名单项"
                   :visible.sync="dialogFormVisible" style="text-align: center">
            <el-form>
                <el-form-item label="SKU：" label-width="90px">
                    <el-input type="text" v-model="dialogForm.sku"></el-input>
                </el-form-item>
                <el-form-item label="商品名称：" label-width="90px">
                    <el-input type="text" v-model="dialogForm.name"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" style="text-align: center">
                <el-button type="primary" @click="dialogCheck">确 定</el-button>
                <el-button @click="dialogFormVisible = false;dialogForm = {}">取 消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import Sequelize from '../config/sequelize'
    import {parseWhiteList, convertWhiteListsToExcelBuffer} from '../utils/util'
    import fs from 'fs'

    export default {
        name: "BlackList",
        data() {
            return {
                currentPage: 1,
                pageSize: 8,
                total: 0,
                whiteLists: [],
                whiteList: {},
                whiteListBak: {},
                dialogFormVisible: false,
                dialogForm: {}
            }
        },
        methods: {
            editRow(row) {
                this.dialogForm = row
                this.dialogFormVisible = true
            },
            deleteRow(row) {
                Sequelize.BlackList.destroy({where: {id: row.id}}).then(() => this.search()).catch(err => {
                    throw err
                })
            },
            dialogCheck() {
                if (this.dialogForm.sku || this.dialogForm.name) {
                    if (this.dialogForm.id) {
                        Sequelize.BlackList.update({
                            sku: this.dialogForm.sku,
                            name: this.dialogForm.name
                        }, {where: {id: this.dialogForm.id}}).then(() => {
                            this.dialogForm = {}
                            this.dialogFormVisible = false
                            this.search()
                        }).catch(err => {
                            throw err
                        })
                    } else {
                        Sequelize.BlackList.create(this.dialogForm).then(() => {
                            this.dialogForm = {}
                            this.dialogFormVisible = false
                            this.search()
                        }).catch(err => {
                            throw err
                        })
                    }
                }
            },
            download() {
                this.$electron.remote.dialog.showSaveDialog({
                    filters: [{name: 'Excel 工作簿', extensions: ['xlsx']}]
                }, (filename) => {
                    if (filename) {
                        Sequelize.BlackList.findAll({where: parseWhiteList(this.whiteListBak)}).then(whiteLists => fs.writeFileSync(filename, convertWhiteListsToExcelBuffer(whiteLists))).catch(err => {
                            throw err
                        })
                    }
                })
            },
            search() {
                this.currentPage = 1
                this.whiteListBak = JSON.parse(JSON.stringify(this.whiteList))
                Sequelize.BlackList.count({where: parseWhiteList(this.whiteList)}).then(count => this.total = count).catch(err => {
                    throw err
                })
                Sequelize.BlackList.findAll({
                    limit: this.pageSize,
                    offset: this.pageSize * this.currentPage - this.pageSize,
                    where: parseWhiteList(this.whiteList)
                }).then(whiteLists => this.whiteLists = whiteLists).catch(err => {
                    throw err
                })
            },
            pageChange() {
                Sequelize.BlackList.findAll({
                    limit: this.pageSize,
                    offset: this.pageSize * this.currentPage - this.pageSize,
                    where: parseWhiteList(this.whiteListBak)
                }).then(whiteLists => this.whiteLists = whiteLists).catch(err => {
                    throw err
                })
            }
        },
        filters: {
            dateToStr(date) {
                return date.toLocaleString()
            }
        },
        mounted() {
            this.search()
        }
    }
</script>
