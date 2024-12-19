# Use a lightweight Node.js Alpine image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock files for dependency installation
COPY package.json yarn.lock ./

# Install production dependencies using Yarn
RUN yarn install --production --from-lockfile

# Copy the rest of the application files
COPY . .

# Set the max-old-space-size to optimize memory usage
ENV NODE_OPTIONS="--max-old-space-size=4048"

# Expose the port for the application
EXPOSE 8000

# Start the server using Yarn
CMD ["yarn", "start"]
