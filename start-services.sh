#!/bin/bash
# PUSPA V4 Service Starter

# Start Next.js
cd /home/z/my-project
node node_modules/.bin/next dev -p 3000 &
NEXT_PID=$!
echo "Next.js PID: $NEXT_PID"

# Start Telegram Bot
cd /home/z/my-project/mini-services/telegram-bot
bun --hot index.ts &
TG_PID=$!
echo "Telegram PID: $TG_PID"

# Keep running
wait
