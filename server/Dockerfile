FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy the rest of the files
COPY . .

# Set the max-old-space-size to 4048
ENV NODE_OPTIONS="--max-old-space-size=4048"

# Expose the port
EXPOSE 8000

# Run the server
CMD ["npm", "run", "start"]