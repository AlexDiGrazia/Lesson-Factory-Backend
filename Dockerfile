FROM --platform=arm64 node:18
WORKDIR /app
COPY COPY package*.json ./
RUN npm ci
COPY . .