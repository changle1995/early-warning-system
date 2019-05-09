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
            path: '/sale',
            name: 'sale',
            component: require('../components/Sale').default
        },
        {
            path: '/removed',
            name: 'removed',
            component: require('../components/Removed').default
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
