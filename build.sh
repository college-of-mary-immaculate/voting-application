#!/bin/bash

# ---------------------------
# Clean previous containers & data (optional)
# ---------------------------
echo "⏳ Cleaning previous containers and data..."
docker compose down -v

rm -rf master/data
rm -rf slave/data
mkdir -p master/data
mkdir -p slave/data

chmod 044 ./master/conf/mysql.conf.cnf
chmod 044 ./slave/conf/mysql.conf.cnf

# ---------------------------
# Build & start containers
# ---------------------------
echo "⏳ Building and starting containers..."
docker compose build
docker compose up -d

# ---------------------------
# Wait for mysql_master to be ready
# ---------------------------
echo "⏳ Waiting for mysql_master..."
until docker exec mysql_master sh -c 'mysql -u root -p111 -e "SELECT 1"' >/dev/null 2>&1
do
    echo "Waiting for mysql_master database connection..."
    sleep 3
done
echo "✅ mysql_master is ready!"

# ---------------------------
# Wait for mysql_slave to be ready
# ---------------------------
echo "⏳ Waiting for mysql_slave..."
until docker exec mysql_slave sh -c 'mysql -u root -p111 -e "SELECT 1"' >/dev/null 2>&1
do
    echo "Waiting for mysql_slave database connection..."
    sleep 3
done
echo "✅ mysql_slave is ready!"

# ---------------------------
# Create replication user
# ---------------------------
echo "⏳ Creating replication user..."
docker exec mysql_master sh -c "mysql -u root -p111 -e \"
CREATE USER IF NOT EXISTS 'mydb_slave_user'@'%' IDENTIFIED BY 'voting_slave';
GRANT REPLICATION SLAVE ON *.* TO 'mydb_slave_user'@'%';
FLUSH PRIVILEGES;
\""

# ---------------------------
# Create Node app users
# ---------------------------
echo "⏳ Creating app users for Node..."
docker exec mysql_master sh -c "mysql -u root -p111 -e \"
CREATE USER IF NOT EXISTS 'mydb_user'@'%' IDENTIFIED BY 'voting_master';
GRANT SELECT, INSERT, UPDATE, DELETE ON voting_db.* TO 'mydb_user'@'%';
CREATE USER IF NOT EXISTS 'voting_slave'@'%' IDENTIFIED BY 'voting_slave';
GRANT SELECT ON voting_db.* TO 'voting_slave'@'%';
FLUSH PRIVILEGES;
\""

# ---------------------------
# Get master status for replication
# ---------------------------
echo "⏳ Configuring replication..."
MS_STATUS=$(docker exec mysql_master sh -c "mysql -u root -p111 -e 'SHOW MASTER STATUS\G'")
CURRENT_LOG=$(echo "$MS_STATUS" | grep File | awk '{print $2}')
CURRENT_POS=$(echo "$MS_STATUS" | grep Position | awk '{print $2}')

start_slave_stmt="RESET SLAVE;
CHANGE MASTER TO MASTER_HOST='mysql_master', MASTER_USER='mydb_slave_user', MASTER_PASSWORD='voting_slave', MASTER_LOG_FILE='$CURRENT_LOG', MASTER_LOG_POS=$CURRENT_POS;
START SLAVE;"

docker exec mysql_slave sh -c "mysql -u root -p111 -e \"$start_slave_stmt\""

# ---------------------------
# Show replication status
# ---------------------------
docker exec mysql_slave sh -c "mysql -u root -p111 -e 'SHOW SLAVE STATUS \G'"

# ---------------------------
# Import voting database into master
# ---------------------------
echo "⏳ Importing voting_db..."
docker exec mysql_master sh -c "mysql -u root -p111 voting_db < /db/voting.sql"

echo "✅ Build complete! Master & Slave running, Node users created."