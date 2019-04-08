<template>
    <div id="app">
        <el-container :style="{height:winHeight + 'px'}">
            <el-aside>
                <el-menu :default-openeds="['1', '2', '3']">
                    <el-submenu index="1">
                        <template slot="title"><i class="el-icon-goods"></i>产品信息</template>
                        <el-menu-item index="1-1">
                            <router-link to='/'>产品详情</router-link>
                        </el-menu-item>
                    </el-submenu>
                    <el-submenu index="2">
                        <template slot="title"><i class="el-icon-tickets"></i>黑白名单</template>
                        <el-menu-item index="2-1">
                            <router-link to='/blackList'>黑名单列表</router-link>
                        </el-menu-item>
                        <el-menu-item index="2-2">
                            <router-link to='/whiteList'>白名单列表</router-link>
                        </el-menu-item>
                    </el-submenu>
                    <el-submenu index="3">
                        <template slot="title"><i class="el-icon-setting"></i>脚本</template>
                        <el-menu-item index="3-1">
                            <router-link to='/script'>脚本执行情况</router-link>
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

        a {
            color: #333;
            display: block;
            text-decoration: none;
        }

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
