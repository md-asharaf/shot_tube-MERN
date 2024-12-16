FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install 

# Update npm
RUN npm update

# Install serve globally
RUN npm install -g serve

# Copy the rest of the files
COPY . .

# Build the frontend
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Expose the port
EXPOSE 3000

#run the server
CMD ["serve", "-s", "dist", "-l", "3000"]

