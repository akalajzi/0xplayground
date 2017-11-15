#!/bin/bash

sudo docker-compose down -v
sudo docker-compose up -d --force-recreate
