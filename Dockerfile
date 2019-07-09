FROM node:10.14.2-alpine

LABEL \
    maintainer="vshn" \
    org.label-schema.build-date=$BUILD_DATE \
    org.label-schema.docker.dockerfile="/Dockerfile" \
    org.label-schema.license="BSD 3-clause 'New' or 'Revised' License" \
    org.label-schema.name="vshn/antora-indexer-cli" \
    org.label-schema.url="https://github.com/vshn/antora-indexer-cli" \
    org.label-schema.vcs-ref=$VCS_REF \
    org.label-schema.vcs-type="Git" \
    org.label-schema.version=$VERSION \
    org.label-schema.vcs-url="https://github.com/vshn/antora-indexer-cli"

WORKDIR /command

COPY ["package.json", "package-lock.json", "./"]
RUN npm install

COPY ["tsconfig.json", "gulpfile.ts", "./"]
COPY src /command/src
RUN \
    node_modules/.bin/gulp && \
    cp /command/dist/antora-indexer.js /usr/local/bin/antora-indexer && \
    cp -R /command/node_modules /usr/local/bin && \
    cp -R /command/dist/lib /usr/local/bin

ENTRYPOINT [ "antora-indexer" ]
