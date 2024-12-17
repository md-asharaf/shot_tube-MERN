FROM node:20.11.1-slim

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./

ENV NODE_OPTIONS="--max-old-space-size=4096"

# Install dependencies
RUN npm install --legacy-peer-deps

# Install serve globally
RUN npm install -g serve

# Copy the rest of the files
COPY . .

# Build the frontend
RUN npm run build

# Expose the port
EXPOSE 3000

#run the server
CMD ["serve", "-s", "dist", "-l", "3000"]

