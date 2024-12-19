# Stage 1: Build the frontend
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock files for dependency installation
COPY package.json yarn.lock ./

# Install all dependencies (including development dependencies for building)
RUN yarn install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Set Node.js options for memory optimization
ENV NODE_OPTIONS="--max-old-space-size=4048"

# Build the frontend using Yarn
RUN yarn run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the build output from the previous stage to Nginx's serve directory
COPY --from=build /app/dist /usr/share/nginx/html

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Create a new Nginx configuration file
RUN echo $'\
server { \n\
    listen 3000; \n\
    server_name localhost; \n\
    root /usr/share/nginx/html; \n\
    index index.html; \n\
    \n\
    location / { \n\
        try_files $uri $uri/ /index.html; \n\
    } \n\
}' > /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]