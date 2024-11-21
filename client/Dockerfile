FROM node:20-alpine
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Install serve globally
RUN npm install -g serve

# Copy the rest of the files
COPY . .
# Replace the existing RUN command with this:
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build
# Build the frontend
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]

