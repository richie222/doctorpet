# Use the official Node.js image as a base image
FROM node:22.14.0

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

# Install app dependencies
RUN npm install

COPY . .

ENV PORT=8000

EXPOSE 8000

CMD [ "npm", "run", "start" ]