#!/bin/bash

git checkout master
git pull
npm run build
sudo docker-compose down -v
sudo docker-compose up -d --force-recreate
