#!/bin/bash

# ---------------------------
# Clean previous containers & data
# ---------------------------
docker compose down -v

rm -rf master/data
rm -rf slave/data
mkdir master/data
mkdir slave/data

chmod 044 ./master/conf/mysql.conf.cnf
chmod 044 ./slave/conf/mysql.conf.cnf

# ---------------------------
# Build & start containers
# ---------------------------
docker compose build
docker compose up -d

# ---------------------------
# Wait for mysql_master to be ready
# ---------------------------
until docker exec mysql_master sh -c 'mysql -h mysql_master -u root -p111 -e "SELECT 1"' >/dev/null 2>&1
do
    echo "Waiting for mysql_master database connection..."
    sleep 4
done
echo "mysql_master is ready!"

# ---------------------------
# Create replication user
# ---------------------------
priv_stmt='GRANT REPLICATION SLAVE ON *.* TO "mydb_slave_user"@"%" IDENTIFIED BY "voting_slave"; FLUSH PRIVILEGES;'
docker exec mysql_master sh -c "mysql -u root -p111 -e '$priv_stmt'"

# ---------------------------
# Wait for mysql_slave to be ready
# ---------------------------
until docker exec mysql_slave sh -c 'mysql -h mysql_slave -u root -p111 -e "SELECT 1"' >/dev/null 2>&1
do
    echo "Waiting for mysql_slave database connection..."
    sleep 4
done
echo "mysql_slave is ready!"

# ---------------------------
# Get master status for replication
# ---------------------------
MS_STATUS=$(docker exec mysql_master sh -c "mysql -u root -p111 -e 'SHOW MASTER STATUS\G'")
CURRENT_LOG=$(echo "$MS_STATUS" | grep File | awk '{print $2}')
CURRENT_POS=$(echo "$MS_STATUS" | grep Position | awk '{print $2}')

# ---------------------------
# Configure slave replication
# ---------------------------
start_slave_stmt="RESET SLAVE; CHANGE MASTER TO MASTER_HOST='mysql_master', MASTER_USER='mydb_slave_user', MASTER_PASSWORD='voting_slave', MASTER_LOG_FILE='$CURRENT_LOG', MASTER_LOG_POS=$CURRENT_POS; START SLAVE;"
docker exec mysql_slave sh -c "mysql -u root -p111 -e \"$start_slave_stmt\""

# ---------------------------
# Show replication status
# ---------------------------
docker exec mysql_slave sh -c "mysql -u root -p111 -e 'SHOW SLAVE STATUS \G'"

# ---------------------------
# Import voting database into master
# ---------------------------
docker exec mysql_master sh -c "mysql -u root -p111 voting_db < /db/voting.sql"

echo "✅ Build complete! Master & Slave running with replication."