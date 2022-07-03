# Docker setup

FROM node:16.15.1 AS dependencies

LABEL maintainer="Minh Hang Nguyen <minhhangnguyen.to@gmail.com>"
LABEL description="Fragments node.js microservice"

ENV NODE_ENV=production

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into the working dir (/app)
COPY package*.json ./

# Copy source code
COPY ./src ./src

# Install node dependencies defined in package-lock.json
RUN npm ci --only=production 

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

#####################################################################

FROM node:16.15.1-alpine@sha256:c785e617c8d7015190c0d41af52cc69be8a16e3d9eb7cb21f0bb58bcfca14d6b AS production

WORKDIR /app

# We default to use port 8080 in our service
ENV PORT=8080

# install curl and dumb-init
RUN apk --no-cache add curl=7.83.1-r2 && apk --no-cache add dumb-init=1.2.5-r1

# copy from previous stage
COPY --chown=node:node --from=dependencies \
/app/node_modules /app/ \
/app/src /app/


# health check
HEALTHCHECK --interval=15s --timeout=30s --start-period=10s --retries=3 \
  CMD curl --fail localhost:${PORT} || exit 1

# switch user to node
USER node

# Start the container by running our server
CMD ["dumb-init", "node", "src/index.js"]

# We run our service on port 8080
EXPOSE 8080


