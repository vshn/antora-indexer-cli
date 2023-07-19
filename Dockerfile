# Step 1: Builder image
FROM docker.io/library/node:20-alpine3.17 AS builder

RUN npm install -g pkg pkg-fetch
ENV NODE node18
ENV PLATFORM alpine
RUN /usr/local/bin/pkg-fetch ${NODE} ${PLATFORM} ${TARGETARCH}

# Install app dependencies
WORKDIR /command
COPY ["package.json", "package-lock.json", "tsconfig.json", "./"]
RUN npm install

# Run tests
COPY spec /command/spec
COPY src /command/src
RUN npm test

# Build executable with Gulp
COPY ["tsconfig.json", "gulpfile.js", "./"]
COPY src /command/src
RUN npm run release

# Package app without dependencies
RUN /usr/local/bin/pkg --targets ${NODE}-${PLATFORM}-${TARGETARCH} dist/antora-indexer.js -o antora-indexer.bin


## Step 2: Runtime image
FROM docker.io/library/alpine:3.18
RUN apk add --no-cache libstdc++
COPY --from=builder /command/antora-indexer.bin /usr/local/bin/antora-indexer
ENTRYPOINT [ "antora-indexer" ]
