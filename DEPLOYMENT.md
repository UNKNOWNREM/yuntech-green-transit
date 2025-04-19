# 雲林綠行通部署指南

本文檔提供「雲林綠行通」PWA應用的部署說明，包括開發環境設置、構建和部署步驟。

## 技術架構

「雲林綠行通」使用以下技術構建：

- 前端框架：React + TypeScript
- 構建工具：Vite
- CSS框架：Tailwind CSS
- 數據可視化：Chart.js
- 地圖功能：Leaflet.js
- 本地存儲：IndexedDB (通過idb庫)
- PWA功能：Workbox

## 開發環境設置

### 系統要求

- Node.js 14.0.0 或更高版本
- npm 6.0.0 或更高版本

### 安裝步驟

1. 克隆代碼庫
```bash
git clone [repository-url]
cd yuntech-green-transit
```

2. 安裝依賴
```bash
npm install
```

3. 啟動開發服務器
```bash
npm run dev
```

開發服務器將在 http://localhost:5173 啟動。

## 構建應用

要構建生產版本，運行：

```bash
npm run build
```

構建後的文件將位於 `dist` 目錄中。

## 部署選項

### 選項1：靜態網站託管

您可以將 `dist` 目錄中的文件部署到任何靜態網站託管服務，如：

- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting

#### 部署到GitHub Pages示例

1. 在 `vite.config.ts` 中設置正確的 `base` 路徑
```typescript
export default defineConfig({
  base: '/yuntech-green-transit/',
  // 其他配置...
})
```

2. 構建應用
```bash
npm run build
```

3. 部署到GitHub Pages
```bash
npm install -g gh-pages
gh-pages -d dist
```

### 選項2：使用Docker部署

1. 創建Dockerfile
```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. 構建Docker鏡像
```bash
docker build -t yuntech-green-transit .
```

3. 運行容器
```bash
docker run -p 8080:80 yuntech-green-transit
```

應用將在 http://localhost:8080 可用。

### 選項3：使用Node.js服務器部署

1. 安裝Express
```bash
npm install express --save
```

2. 創建server.js文件
```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

3. 啟動服務器
```bash
node server.js
```

## PWA配置

「雲林綠行通」已配置為漸進式Web應用(PWA)，支持：

- 離線功能
- 添加到主屏幕
- 快速加載

PWA配置位於 `vite.config.ts` 和 `public` 目錄中的清單文件。

## 環境變量

您可以通過創建 `.env` 文件來配置環境變量：

```
VITE_APP_TITLE=雲林綠行通
VITE_APP_API_URL=https://api.example.com
```

## 故障排除

### 常見問題

1. **構建失敗**
   - 確保所有依賴都已正確安裝
   - 檢查TypeScript錯誤

2. **PWA功能不工作**
   - 確保應用通過HTTPS提供
   - 檢查Service Worker註冊

3. **地圖不顯示**
   - 確保有網絡連接（首次加載地圖需要網絡）
   - 檢查Leaflet.js是否正確加載

## 性能優化

為獲得最佳性能，請考慮：

1. 啟用Gzip壓縮
2. 配置適當的緩存頭
3. 使用CDN提供靜態資源

## 安全考慮

1. 確保應用通過HTTPS提供
2. 定期更新依賴以修復安全漏洞
3. 實施內容安全策略(CSP)

## 更多資源

- [React文檔](https://reactjs.org/)
- [Vite文檔](https://vitejs.dev/)
- [Tailwind CSS文檔](https://tailwindcss.com/)
- [PWA文檔](https://web.dev/progressive-web-apps/)
