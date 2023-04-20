FROM node:16-stretch


ARG APP_VERSION=v1.0.0

ARG GITLAB_AUTH_TOKEN

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
# set the npm version in package.json file
RUN npm version --no-git-tag-version $APP_VERSION --allow-same-version
RUN npm ci

# TODO: make build here instead of complete folder
COPY . ./


# ENTRYPOINT [ "npm", "run", "prod"]
ENTRYPOINT [ "npm", "run", "debug"]
 