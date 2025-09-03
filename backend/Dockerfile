# backend/Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Build TypeScript
RUN npm run build

# Expose the port
EXPOSE 5001

# Start the app
CMD ["npm", "run", "start"]
