# Use official Node image
FROM node:20

# Create app directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's code
COPY . .

# Expose the port your app runs on (adjust if not 3000)
EXPOSE 3000

# Start your app
CMD ["node", "server.js"]

