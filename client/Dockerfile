FROM node:20-alpine
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Install serve globally
RUN npm install -g serve

# Copy the rest of the files
COPY . .

# Build the frontend
RUN npm run build

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]

