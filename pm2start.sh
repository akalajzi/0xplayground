#!/bin/bash

git checkout master
git pull
npm i
npm run build
pm2 start dist/server.js -i max
