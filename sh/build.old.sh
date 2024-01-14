#!/bin/bash
free -m
echo "=========================== Checkout ============================"
git checkout . 

echo "=========================== Pull Repository ================================="
git pull

echo "======================== Send telegram down service ========================="
bash send-telegram-down-service.sh

npm install 

echo "============================= Start Building Microservice ============================="
npm run build:microservice
wait
echo "============================= Start Building Service ============================="
npm run build
echo "============================= Build Complete ============================="
echo "=========================================================================="
echo "============================= Start Docker ==============================="
sh docker.sh
echo "============================ Restart PM2 ================================="
pm2 restart ecosystem.config.js

pm2 save

pm2 startup
echo "============================ PM2 Upstream ================================="
pm2 list 
echo "===================== Send Telegram Build Success ========================"
bash send-telegram-package-info.sh
echo "===================== Build Complete, Bye Bye!!! ========================="
free -m 
exit 0