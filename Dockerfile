FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN npm install --prefix ./server
RUN npm install --legacy-peer-deps --prefix ./client

COPY . .
ENV NODE_OPTIONS="--max-old-space-size=3072"
RUN npm run build --prefix ./client

EXPOSE 8000

CMD ["npm", "run", "start", "--prefix", "./server"]