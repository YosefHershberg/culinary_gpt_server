# Use a lightweight Node.js image
FROM node:22-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy manifest + lockfile first for better layer caching
COPY package*.json ./

# Install dependencies from the lockfile (reproducible, fails on drift)
RUN npm ci

# Copy the rest of the application code (honors .dockerignore)
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Drop root privileges (logs go to stdout, so no writable dir is needed)
USER node

# Expose the port your application is running on
EXPOSE 5000

# Start the application
CMD [ "npm", "start" ]
