# Use the official Node.js 18 image as the base image
FROM node:18.20.3-bullseye-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the project dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the default Strapi port (1337)
EXPOSE 1337

# Set the NODE_ENV environment variable to "production"
ENV NODE_ENV production

# Build the Strapi application
RUN npm run build

# Set the command to start the Strapi server
CMD ["npm", "run", "start"]