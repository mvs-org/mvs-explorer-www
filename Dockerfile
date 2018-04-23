FROM nginx

RUN apt-get update \
    && apt-get install -y \
    curl \
    gnupg \
    && curl -sL https://deb.nodesource.com/setup_6.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g grunt-cli

COPY . /usr/share/nginx/html
WORKDIR /usr/share/nginx/html

RUN npm install && grunt
