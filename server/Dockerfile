FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install 

COPY . .
ENV NODE_OPTIONS="--max-old-space-size=4048"

EXPOSE 8000

CMD ["npm", "run", "start"]