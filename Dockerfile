# FROM --platform=arm64 node:18   For running in prod I think
# FROM --platform=linux/amd64 node:18   for AWS Linux EC2
FROM --platform=arm64 node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD npm run start:prod