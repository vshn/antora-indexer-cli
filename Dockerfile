# Step 1: Builder image
FROM node:12.22.0-alpine3.11 AS builder

RUN npm install -g pkg pkg-fetch
ENV NODE node12
ENV PLATFORM alpine
ENV ARCH x64
RUN /usr/local/bin/pkg-fetch ${NODE} ${PLATFORM} ${ARCH}

# Install app dependencies
WORKDIR /command
COPY ["package.json", "package-lock.json", "./"]
RUN npm install

# Build executable with Gulp
COPY ["tsconfig.json", "gulpfile.js", "./"]
COPY src /command/src
RUN npm run release

# Package app without dependencies
RUN /usr/local/bin/pkg --targets ${NODE}-${PLATFORM}-${ARCH} dist/antora-indexer.js -o antora-indexer.bin


## Step 2: Runtime image
FROM alpine:3.13
RUN apk add --no-cache libstdc++
COPY --from=builder /command/antora-indexer.bin /usr/local/bin/antora-indexer
ENTRYPOINT [ "antora-indexer" ]
