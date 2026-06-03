@echo off
cd /d "%~dp0"
echo Starting Vegetation Collage Editor...
echo.
echo Keep this window open while using the app.
echo URL: http://127.0.0.1:5173/
echo.
npm run dev -- --host 127.0.0.1 --port 5173
pause
