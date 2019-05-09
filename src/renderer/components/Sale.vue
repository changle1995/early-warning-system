<template>
    <div id="report" style="width: 100%">
        <el-form label-width="200px" size="mini">
            <el-row>
                <el-col :span="12">
                    <el-form-item label="阈值：">
                        <el-input type="number" v-model.number="saleStock"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item style="text-align: left">
                        <el-button type="primary" icon="el-icon-check" @click="editSaleStock"></el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <hr>
        <br>
        <el-form label-width="90px" size="mini">
            <el-row>
                <el-col :span="8">
                    <el-form-item label="SKU：">
                        <el-input v-model="sku"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="16">
                    <el-form-item label="名称：">
                        <el-input v-model="name"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item style="text-align: center">
                <el-button type="primary" icon="el-icon-search" @click="search"></el-button>
                <el-button type="primary" icon="el-icon-upload2" @click="upload"></el-button>
                <el-button type="primary" icon="el-icon-download" @click="download"></el-button>
                <el-button type="primary" icon="el-icon-refresh" @click="analyse"></el-button>
                <el-button type="primary" icon="el-icon-sold-out" @click="soldOut"></el-button>
            </el-form-item>
        </el-form>

        <el-table ref="multipleTable" :data="listShow" style="width: 100%;" border height="500"
                  @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="40"></el-table-column>
            <el-table-column prop="sku" label="SKU" width="100"></el-table-column>
            <el-table-column prop="name" label="商品名称" show-overflow-tooltip></el-table-column>
            <el-table-column prop="stock" label="库存" width="100"></el-table-column>
        </el-table>
        <el-pagination background layout="prev, pager, next" style="text-align: center; margin-top: 10px"
                       :current-page.sync="currentPage" :page-size="pageSize" :total="list.length"
                       @current-change="refreshListShow">
        </el-pagination>
    </div>
</template>

<script>
    import Sequelize from '../config/sequelize'
    import {Op} from 'sequelize'
    import fs from 'fs'
    import path from 'path'
    import xlsx from 'node-xlsx'

    export default {
        name: "Sale",
        data() {
            return {
                currentPage: 1,
                pageSize: 8,
                list: [],
                listShow: [],
                sales: [],
                saleStock: 50,
                multipleSelectionSet: new Set(),
                sku: '',
                name: ''
            }
        },
        methods: {
            handleSelectionChange(selection) {
                this.multipleSelectionSet = new Set([...Array.from(this.multipleSelectionSet), ...selection])
                this.listShow.filter(el => !selection.includes(el)).forEach(value => this.multipleSelectionSet.delete(value))
            },
            //编辑阈值
            editSaleStock() {
                fs.readFile(path.resolve(this.$electron.remote.app.getPath('userData'), './config.json'), 'utf8', (err, data) => {
                    if (err) throw err
                    let config = JSON.parse(data)
                    config['saleStock'] = this.saleStock
                    fs.writeFile(path.resolve(this.$electron.remote.app.getPath('userData'), './config.json'),
                        JSON.stringify(config), 'utf8',
                        err => {
                            if (err) throw err
                        })
                })
            },
            //删除原数据并上传新数据
            upload() {
                this.$electron.remote.dialog.showOpenDialog({
                    properties: ['openFile', 'showHiddenFiles'],
                    filters: [{name: 'Excel 工作簿', extensions: ['xls', 'xlsx']}]
                }, (filename) => {
                    if (filename && filename[0]) {
                        Sequelize.MyProduct.destroy({where: {state: 1}})
                        let workSheetsFromFile = xlsx.parse(filename[0])[0]['data']
                        if (workSheetsFromFile && workSheetsFromFile.length > 0) {
                            Sequelize.MyProduct.bulkCreate(workSheetsFromFile.filter((value, index) => {
                                return index !== 0
                            }).map(value => {
                                return {sku: value[0].trim(), state: 1}
                            })).finally(() => {
                                this.getData()
                            })
                        }
                        this.getData()
                    }
                })
            },
            //根据sku和名称过滤
            search() {
                if (this.sku || this.name) {
                    this.list = this.sales.filter(value => {
                        return value.sku.match(this.sku) && value.name.match(this.name)
                    })
                } else {
                    this.list = this.sales
                }
                this.currentPage = 1
                this.refreshListShow()
            },
            //低于阈值的勾选并靠前
            analyse() {
                this.currentPage = 1
                this.sku = ''
                this.name = ''
                this.multipleSelectionSet = new Set(this.sales.filter(value => {
                    return value.stock < this.saleStock
                }))
                this.sales = [...this.multipleSelectionSet, ...this.sales.filter(value => {
                    return !this.multipleSelectionSet.has(value)
                })]
                this.list = this.sales
                this.refreshListShow()
            },
            //下架multipleSelectionSet中的商品
            soldOut() {
                Sequelize.MyProduct.update({state: 0}, {
                    where: {id: {[Op.in]: Array.from(this.multipleSelectionSet).map(value => value.id)}}
                }).then(() => {
                    this.multipleSelectionSet = new Set()
                    this.getData()
                }).catch(err => {
                    throw err
                })
            },
            //根据multipleSelectionSet导出数据
            download() {
                this.$electron.remote.dialog.showSaveDialog({
                    filters: [{name: 'Excel 工作簿', extensions: ['xlsx']}]
                }, (filename) => {
                    if (filename) {
                        let header = [
                            'SKU',
                            '商品名称',
                            '库存'
                        ]
                        let data = Array.from(this.multipleSelectionSet).map(value => {
                            return [
                                value.sku,
                                value.name,
                                value.stock
                            ]
                        })
                        data.unshift(header)
                        fs.writeFileSync(filename, xlsx.build([{name: "sheet1", data: data}]))
                    }
                })
            },
            //获取所有数据
            getData() {
                this.currentPage = 1
                Sequelize.MyProduct.findAll({
                    where: {state: 1},
                    order: [['id', 'ASC']]
                }).then(sales => {
                    this.sales = sales.map(sale => {
                        return {
                            id: sale.id,
                            sku: sale.sku,
                            name: '',
                            stock: null,
                            state: sale.state
                        }
                    })
                    Sequelize.Product.findOne({order: [['batch_no', 'desc']]}).then(maxBatchNo => {
                        Sequelize.Product.findAll({where: {batchNo: maxBatchNo.batchNo}})
                            .then(products => {
                                products.forEach(product => {
                                    this.sales.forEach(sale => {
                                        if (product.sku === sale.sku) {
                                            sale.name = product.name
                                            sale.stock = product.stock
                                        }
                                    })
                                })
                            })
                            .finally(() => {
                                this.list = this.sales
                                this.refreshListShow()
                            })
                    }).catch(err => {
                        throw err
                    })
                }).catch(err => {
                    throw err
                })
            },
            //翻页
            refreshListShow() {
                this.listShow = this.list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
                this.selectCurrentPage()
            },
            //根据总的选择情况自动选中当前页数据
            selectCurrentPage() {
                let selection = []
                this.listShow.forEach(value => {
                    if (this.multipleSelectionSet.has(value)) {
                        selection.push(value)
                    }
                })
                selection.forEach(value => {
                    setTimeout(() => {
                        this.$refs.multipleTable.toggleRowSelection(value, true)
                    }, 0)
                })
            }
        },
        mounted() {
            this.getData()
            fs.readFile(path.resolve(this.$electron.remote.app.getPath('userData'), './config.json'), 'utf8', (err, data) => {
                if (err) throw err
                this.saleStock = !isNaN(JSON.parse(data)['saleStock']) ? JSON.parse(data)['saleStock'] : this.saleStock
            })
        }
    }
</script>
