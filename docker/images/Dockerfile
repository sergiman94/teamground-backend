FROM node:14

# Set the Docker container working directory
ENV DOCKER_WORKING_DIR="/usr/local/teamground"

# Set the working directory
WORKDIR ${DOCKER_WORKING_DIR}

# Copy package.json and package-lock.json (if available) into the container
COPY package*.json ./

# Copy the rest of the application code into the container
COPY . .

# install global dependencies
RUN npm install -g typescript nodemon

# install application dependencies
RUN npm install --verbose