# Use the official Node.js image as a base image
FROM node:22.14.0

# Create app directory
WORKDIR /usr/src/app

COPY . .

# Install app dependencies
RUN npm ci

ENV PORT=8000
# Install app dependencies
EXPOSE 8000

CMD [ "npm", "run", "start" ]