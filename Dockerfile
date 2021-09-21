# Step 1: Builder image
FROM node:16-alpine3.14 AS builder

RUN npm install -g pkg@4.5.1 pkg-fetch@2.6.9
ENV NODE node14
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
FROM alpine:3.14
RUN apk add --no-cache libstdc++
COPY --from=builder /command/antora-indexer.bin /usr/local/bin/antora-indexer
ENTRYPOINT [ "antora-indexer" ]
