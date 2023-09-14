#!/bin/bash

cd node

ls -la

yarn

docker compose up -d


while ! docker exec node-mysql-order-1  mysql --user=root --password=docker -e "SELECT 1" >/dev/null 2>&1; do
    echo "Waiting for database connection..."
    sleep 1
done

yarn typeorm:migration

yarn seeder

yarn start
