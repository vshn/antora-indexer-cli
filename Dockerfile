# Step 1: Builder image
FROM docker.io/library/node:18.15.0-alpine3.16 AS builder

RUN npm install -g pkg@4.5.1 pkg-fetch@2.6.9
ENV NODE node14
ENV PLATFORM alpine
ENV ARCH x64
RUN /usr/local/bin/pkg-fetch ${NODE} ${PLATFORM} ${ARCH}

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
RUN /usr/local/bin/pkg --targets ${NODE}-${PLATFORM}-${ARCH} dist/antora-indexer.js -o antora-indexer.bin


## Step 2: Runtime image
FROM docker.io/library/alpine:3.17
RUN apk add --no-cache libstdc++
COPY --from=builder /command/antora-indexer.bin /usr/local/bin/antora-indexer
ENTRYPOINT [ "antora-indexer" ]
