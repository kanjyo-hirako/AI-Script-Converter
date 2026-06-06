import { createApp } from 'vue'
import { MotionPlugin } from 'motion-v'
import './style.css'
import App from './App.vue'

createApp(App).use(MotionPlugin).mount('#app')
