#!/bin/bash

git checkout separated-web3
git pull
npm run build
sudo docker-compose down -v
sudo docker-compose up -d --force-recreate
