FROM nginx

RUN apt-get update \
    && apt-get install -y \
    curl \
    gnupg \
    && curl -sL https://deb.nodesource.com/setup_6.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g grunt-cli

COPY . .

RUN rm -rf dist min-safe min && npm i && grunt

RUN cp -r ./dist/* /usr/share/nginx/html
