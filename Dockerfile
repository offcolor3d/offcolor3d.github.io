# Use the official Node.js image as the base image
FROM node:lts-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the application will run on (Astro)
EXPOSE 4321

# Start the application
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]