FROM node:18-alpine as builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with specific version of yargs
RUN npm ci --omit=dev

FROM node:18-alpine

WORKDIR /app

# Copy --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/node_modules ./node_modules

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "index.js", "start"]
