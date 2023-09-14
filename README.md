# order-food

## 簡介
* 這是一個點餐系統 GraphQL API Server
* 使用的技能：Node.js、GraphQL、MySQL、Redis、Docker

## 環境建置
* Node.js: v12 up
* Docker
* 可執行 shell script 的環境

## 安裝與執行步驟
1. 將專案複製到本機 ( Clone Repository )
```
git clone 
```
2. 進入專案資料夾
```
cd order-food
```
3. 直接執行 init.sh 腳本
```
./init.sh 或 sh init.sh
```
4. 啟動專案
```
跑完 sh init.sh 會自動啟動專案
http://localhost:5000/webAPI/v1
```

## 指令說明
* 編譯專案
```
yarn compile
```
* 初始化 MySQL 資料庫
```
yarn typeorm:migration
```
* 手動執行專案
```
yarn start
```
* 餵資料給 MySQL
```
yarn seeder
```

## API 文件
* StoreBrandQuery 查詢所有店家，包含菜單
* RestaurantQuery 查詢所有店家所屬的餐廳
* OrderQuery 查詢所有訂單
* OrderMutation.createOrder 使用者新增訂單，依據使用者位置找出最近的餐廳
* OrderMutation.takeOrder 外送員接單
* OrderMutation.reportOrder 外送員回報訂單，包含上報 GPS 位置、結單、取消接單

## 效能考量
* 因考量流量問題，會有多個 Request 進來，所以在設計上會先將空白訂單資料寫入 MySQL，之後新增訂單只需要 update 一筆資料，避免 insert 造成 lock table 的問題
* 寫入空白訂單是透過 Redis BullMQ 來做排程，持續判斷並擴增空白訂單資料量
* 透過 Redis 來做快取，避免多次查詢 MySQL
