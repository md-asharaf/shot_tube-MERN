FROM node:20-alpine

WORKDIR /app

# Copy and install dependencies first to leverage caching
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port and run the application
EXPOSE 8000

CMD ["npm","run", "start"]
