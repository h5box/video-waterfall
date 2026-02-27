import { createApp } from 'vue'
import './style.css'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import App from './App.vue'
import VueVirtualScroller from 'vue-virtual-scroller'

const app = createApp(App)
app.use(VueVirtualScroller)
app.mount('#app')
