# Use Node.js image
FROM node:18-alpine
# Set working directory
WORKDIR /app
# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm i --only=production
# Copy all files
COPY . .
# Expose backend port
EXPOSE 8080
# Run the server
CMD [ "npm", "run", "start" ]