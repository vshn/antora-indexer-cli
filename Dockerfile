FROM node:10.14.2-alpine AS builder
WORKDIR /command
COPY ["package.json", "package-lock.json", "./"]
RUN npm install
