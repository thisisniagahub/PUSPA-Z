#!/bin/bash
# Simple process supervisor for PUSPA V4

LOG_DIR="/tmp/puspa-logs"
mkdir -p $LOG_DIR

# Start Next.js
cd /home/z/my-project
node node_modules/.bin/next dev -p 3000 > $LOG_DIR/next.log 2>&1 &
NEXT_PID=$!
echo "[$(date)] Next.js started: PID $NEXT_PID" >> $LOG_DIR/supervisor.log

# Start Telegram Bot
cd /home/z/my-project/mini-services/telegram-bot
bun --hot index.ts > $LOG_DIR/telegram.log 2>&1 &
TG_PID=$!
echo "[$(date)] Telegram Bot started: PID $TG_PID" >> $LOG_DIR/supervisor.log

# Monitor loop
while true; do
  if ! ps -p $NEXT_PID > /dev/null 2>&1; then
    echo "[$(date)] Next.js died, restarting..." >> $LOG_DIR/supervisor.log
    cd /home/z/my-project
    node node_modules/.bin/next dev -p 3000 > $LOG_DIR/next.log 2>&1 &
    NEXT_PID=$!
  fi
  
  if ! ps -p $TG_PID > /dev/null 2>&1; then
    echo "[$(date)] Telegram Bot died, restarting..." >> $LOG_DIR/supervisor.log
    cd /home/z/my-project/mini-services/telegram-bot
    bun --hot index.ts > $LOG_DIR/telegram.log 2>&1 &
    TG_PID=$!
  fi
  
  sleep 10
done
