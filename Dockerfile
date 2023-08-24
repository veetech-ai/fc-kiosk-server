FROM node:16-buster


ARG APP_VERSION=v1.0.0

ARG GITLAB_AUTH_TOKEN

ENV APP_VERSION $APP_VERSION

# Install dependencies for puppetteer
RUN apt update && apt install -y \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    libgbm1 \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgtk-3-0 \
    lsb-release \
    xdg-utils \
    wget \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libsqlite3-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator1 \
    libnss3 \
    lsb-release \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*


# Create a non-root user named "appuser"
RUN useradd -u 1001 -r -g 0 -m -d /home/appuser -s /sbin/nologin -c "Node.js user" appuser

# Set the working directory
WORKDIR /app

# Change ownership of the working directory to "appuser"
RUN chown -R appuser:root /app

# Switch to the non-root user
USER appuser

COPY package.json package-lock.json .npmrc ./
# set the npm version in package.json file
RUN npm version --no-git-tag-version $APP_VERSION --allow-same-version
RUN npm ci

# TODO: make build here instead of complete folder
COPY . ./


# ENTRYPOINT [ "npm", "run", "prod"]
ENTRYPOINT [ "npm", "run", "debug"]
 