<template>
    <div id="app">
        <el-container :style="{height:winHeight + 'px'}">
            <el-aside>
                <el-menu :default-openeds="['1', '2', '3']" router>
                    <el-submenu index="1">
                        <template slot="title"><i class="el-icon-goods"></i>产品信息</template>
                        <el-menu-item index="/">
                            <span slot="title">产品详情</span>
                        </el-menu-item>
                    </el-submenu>
                    <el-submenu index="2">
                        <template slot="title"><i class="el-icon-tickets"></i>上下架管理</template>
                        <el-menu-item index="/sale">
                            <span slot="title">在售商品</span>
                        </el-menu-item>
                        <el-menu-item index="/removed">
                            <span slot="title">已下架商品</span>
                        </el-menu-item>
                    </el-submenu>
                    <el-submenu index="3">
                        <template slot="title"><i class="el-icon-setting"></i>脚本</template>
                        <el-menu-item index="/script">
                            <span slot="title">脚本执行情况</span>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>

            <el-container class="main">
                <router-view></router-view>
            </el-container>
        </el-container>
    </div>
</template>

<script>
    import Sequelize from './config/sequelize'

    export default {
        name: 'App',
        data() {
            return {
                winHeight: document.documentElement.clientHeight
            }
        },
        beforeCreate() {
            Sequelize.sequelize.sync()
        },
        mounted() {
            window.onresize = () => {
                this.winHeight = document.documentElement.clientHeight
            }
        }
    }
</script>

<style lang="scss">
    * {
        margin: 0px;
        padding: 0px;
    }

    .el-aside {
        width: 200px !important;
        background: #eee;

        .el-menu {
            background: #eee;
        }
    }

    .el-container {
        width: 100%;
    }

    .main {
        overflow-y: auto;
        padding: 20px 10px;
        width: 100%;
    }

    .content {
        width: 100%;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0;
    }
</style>
