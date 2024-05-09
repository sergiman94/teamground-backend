# using the latest mongo db image
FROM mongodb/mongodb-community-server:latest

# Set the Docker container working directory
ENV ENV DOCKER_WORKING_DIR="/usr/local/mongo"

# Set the working directory
WORKDIR ${DOCKER_WORKING_DIR}

# copy script file to create collections into container
COPY ./scripts/createCollections.js ./
