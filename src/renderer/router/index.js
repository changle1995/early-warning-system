import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/product',
            name: 'product',
            component: require('../components/Product').default
        },
        {
            path: '/whiteList',
            name: 'whiteList',
            component: require('../components/WhiteList').default
        },
        {
            path: '/blackList',
            name: 'blackList',
            component: require('../components/BlackList').default
        },
        {
            path: '/script',
            name: 'script',
            component: require('../components/Script').default
        },
        {
            path: '*',
            redirect: '/product'
        }
    ]
})
