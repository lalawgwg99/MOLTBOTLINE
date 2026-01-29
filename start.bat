@echo off
chcp 65001 >nul
echo [MOLTBOT LAUNCHER]
echo ==========================================
echo 正在檢查環境設置...

if not exist ".env" (
    echo [警告] 找不到 .env 檔案！
    echo 請將 .env.example 複製為 .env 並填入您的 API Key。
    echo.
    echo 正在為您複製範本...
    copy .env.example .env
    echo 請開啟 .env 檔案填寫金鑰後，再次執行此腳本。
    pause
    exit
)

if not exist "node_modules" (
    echo [系統] 首次啟動，正在安裝依賴套件...
    call npm install
)

echo [系統] 啟動 MOLTBOT AI Server...
echo [提示] 請確保您已開啟 ngrok (如果需要對外連線)
echo.
call npx tsx watch src/index.ts

pause
