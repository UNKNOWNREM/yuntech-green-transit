import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// PWA 註冊功能將在後續添加
// 暫時註釋掉以解決構建錯誤
// import { registerSW } from 'virtual:pwa-register'

// if ('serviceWorker' in navigator) {
//   registerSW()
// }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
