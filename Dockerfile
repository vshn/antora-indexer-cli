# Step 1: Builder image
FROM node:12.16.3-alpine3.11 AS builder

RUN npm install -g pkg pkg-fetch
ENV NODE node10
ENV PLATFORM alpine
ENV ARCH x64
RUN /usr/local/bin/pkg-fetch ${NODE} ${PLATFORM} ${ARCH}

# Install app dependencies
WORKDIR /command
COPY ["package.json", "package-lock.json", "./"]
RUN npm install

# Build executable with Gulp
COPY ["tsconfig.json", "gulpfile.ts", "./"]
COPY src /command/src
RUN node_modules/.bin/gulp

# Package app without dependencies
RUN /usr/local/bin/pkg --targets ${NODE}-${PLATFORM}-${ARCH} dist/antora-indexer.js -o antora-indexer.bin


# Step 2: Runtime image
FROM alpine:3.12
RUN apk add --no-cache libstdc++
COPY --from=builder /command/antora-indexer.bin /usr/local/bin/antora-indexer
ENTRYPOINT [ "antora-indexer" ]
