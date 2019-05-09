<template>
    <div id="report" style="width: 100%">
        <el-form label-width="90px" size="mini">
            <el-row>
                <el-col :span="8">
                    <el-form-item label="SKU：">
                        <el-input v-model="product.sku"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="16">
                    <el-form-item label="名称：">
                        <el-input v-model="product.name"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row>
                <el-col :span="12">
                    <el-form-item label="价格：">
                        <el-col :span="11">
                            <el-input v-model.number="product.priceGte" type="number"></el-input>
                        </el-col>
                        <el-col style="text-align: center" :span="2">-</el-col>
                        <el-col :span="11">
                            <el-input v-model.number="product.priceLte" type="number"></el-input>
                        </el-col>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="库存：">
                        <el-col :span="11">
                            <el-input v-model.number="product.stockGte" type="number"></el-input>
                        </el-col>
                        <el-col style="text-align: center" :span="2">-</el-col>
                        <el-col :span="11">
                            <el-input v-model.number="product.stockLte" type="number"></el-input>
                        </el-col>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row>
                <el-col :span="6">
                    <el-form-item label="进货：">
                        <el-select clearable v-model="product.purchase">
                            <el-option label="是" value="是"></el-option>
                            <el-option label="否" value="否"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="清仓：">
                        <el-select clearable v-model="product.clearance">
                            <el-option label="是" value="是"></el-option>
                            <el-option label="否" value="否"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="侵权：">
                        <el-select clearable v-model="product.tort">
                            <el-option label="是" value="是"></el-option>
                            <el-option label="否" value="否"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="状态：">
                        <el-select clearable v-model="product.state">
                            <el-option label="下架" value="下架"></el-option>
                            <el-option label="在售" value="在售"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row>
                <el-col :span="6">
                    <el-form-item label="批次号：">
                        <el-input v-model="product.batchNo"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="商品资料：">
                        <el-select clearable v-model="product.information">
                            <el-option label="更新" value="更新"></el-option>
                            <el-option label="无更新" value="无更新"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="更新时间：">
                        <el-col :span="11">
                            <el-date-picker type="date" placeholder="起始日期" v-model="product.updateTimeGte"
                                            value-format="yyyy-MM-dd" style="width: 100%"></el-date-picker>
                        </el-col>
                        <el-col style="text-align: center" :span="2">-</el-col>
                        <el-col :span="11">
                            <el-date-picker type="date" placeholder="结束日期" v-model="product.updateTimeLte"
                                            value-format="yyyy-MM-dd" style="width: 100%"></el-date-picker>
                        </el-col>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-form-item style="text-align: center">
                <el-button type="primary" icon="el-icon-search" @click="search"></el-button>
                <el-button type="warning" icon="el-icon-delete" @click="product = {}"></el-button>
                <el-button type="success" icon="el-icon-download" @click="download"></el-button>
            </el-form-item>
        </el-form>

        <el-table :data="products" style="width: 100%;" border height="450">
            <el-table-column prop="batchNo" label="批次号" width="150"></el-table-column>
            <el-table-column prop="sku" label="SKU" width="100"></el-table-column>
            <el-table-column prop="name" label="商品名称" show-overflow-tooltip></el-table-column>
            <el-table-column label="价格" width="100">
                <template slot-scope="scope"> {{scope.row.price | currency}}</template>
            </el-table-column>
            <el-table-column prop="stock" label="库存" width="80"></el-table-column>
            <el-table-column prop="purchase" label="进货" width="50"></el-table-column>
            <el-table-column prop="clearance" label="清仓" width="50"></el-table-column>
            <el-table-column prop="tort" label="侵权" width="50"></el-table-column>
            <el-table-column prop="information" label="商品资料" width="100"></el-table-column>
            <el-table-column prop="state" label="商品状态" width="100"></el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="150"></el-table-column>
        </el-table>
        <el-pagination background layout="prev, pager, next" style="text-align: center; margin-top: 10px"
                       :current-page.sync="currentPage" :page-size="pageSize" :total="total"
                       @current-change="pageChange">
        </el-pagination>
    </div>
</template>

<script>
    import Sequelize from '../config/sequelize'
    import {parseProduct, convertProductsToExcelBuffer} from '../utils/util'
    import fs from 'fs'

    export default {
        name: "Product",
        data() {
            return {
                currentPage: 1,
                pageSize: 8,
                total: 0,
                products: [],
                product: {},
                productBak: {}
            }
        },
        methods: {
            download() {
                this.$electron.remote.dialog.showSaveDialog({
                    filters: [{name: 'Excel 工作簿', extensions: ['xlsx']}]
                }, (filename) => {
                    if (filename) {
                        Sequelize.Product.findAll({where: parseProduct(this.productBak), order: [['batch_no', 'desc']]}).then(products => {
                            fs.writeFileSync(filename, convertProductsToExcelBuffer(products))
                        }).catch(err => {
                            throw err
                        })
                    }
                })
            },
            search() {
                this.currentPage = 1
                this.productBak = JSON.parse(JSON.stringify(this.product))
                Sequelize.Product.count({where: parseProduct(this.product), order: [['batch_no', 'desc']]}).then(count => this.total = count).catch(err => {
                    throw err
                })
                Sequelize.Product.findAll({
                    limit: this.pageSize,
                    offset: this.pageSize * this.currentPage - this.pageSize,
                    where: parseProduct(this.product),
                    order: [['batch_no', 'desc']]
                }).then(products => this.products = products).catch(err => {
                    throw err
                })
            },
            pageChange() {
                Sequelize.Product.findAll({
                    limit: this.pageSize,
                    offset: this.pageSize * this.currentPage - this.pageSize,
                    where: parseProduct(this.productBak),
                    order: [['batch_no', 'desc']]
                }).then(products => this.products = products).catch(err => {
                    throw err
                })
            }
        },
        filters: {
            currency(price) {
                return '$ ' + price.toFixed(2)
            }
        },
        mounted() {
            Sequelize.Product.findOne({order: [['batch_no', 'desc']]}).then(maxBatchNo => {
                this.product = {batchNo: maxBatchNo.batchNo}
                this.search()
            }).catch(err => {
                throw err
            })
        }
    }
</script>
