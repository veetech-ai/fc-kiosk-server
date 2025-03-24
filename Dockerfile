FROM node:16-buster


ARG APP_VERSION=v1.0.0

ARG GITHUB_AUTH_TOKEN

ENV APP_VERSION $APP_VERSION

# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install curl gnupg -y \
  && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install google-chrome-stable -y --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*


COPY package.json package-lock.json .npmrc ./
# set the npm version in package.json file
RUN npm version --no-git-tag-version $APP_VERSION --allow-same-version
RUN npm ci

# TODO: make build here instead of complete folder
COPY . ./


# ENTRYPOINT [ "npm", "run", "prod"]
ENTRYPOINT [ "npm", "run", "debug"]
 