FROM node:20-slim

# Install FFmpeg
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY . .

# Cloud Run injects the PORT env var (default 8080)
ENV PORT=8080
EXPOSE 8080

CMD [ "npm", "start" ]
