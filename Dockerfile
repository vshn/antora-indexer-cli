# Step 1: Builder image
FROM node:10.20.1-alpine AS builder

WORKDIR /command
COPY ["package.json", "package-lock.json", "./"]
RUN npm install

COPY ["tsconfig.json", "gulpfile.ts", "./"]
COPY src /command/src
RUN node_modules/.bin/gulp


# Step 2: Runtime image
FROM node:10.20.1-alpine

WORKDIR /command
COPY ["package.json", "package-lock.json", "./"]
RUN npm install --production

COPY --from=builder /command/dist/antora-indexer.js /usr/local/bin/antora-indexer
COPY --from=builder /command/dist/lib /usr/local/bin/lib
RUN cp -R /command/node_modules /usr/local/bin

ENTRYPOINT [ "antora-indexer" ]

