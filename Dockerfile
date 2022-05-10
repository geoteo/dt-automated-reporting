##FROM node:current-alpine
FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN  apt-get update && apt-get -y install ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils && \
    npm install && \
    apt-get clean

COPY *.js  .
COPY lib lib
#COPY config.json .
#RUN mkdir -p /root/.config/configstore
RUN mkdir -p /root/.config/ /usr/src/app/mnt && \
    ln -s /usr/src/app/mnt/config/configstore /root/.config/configstore && \
    ln -s /usr/src/app/mnt/config/config.json /usr/src/app/config.json && \
    ln -s /usr/src/app/mnt/reports /usr/src/app/reports

CMD [ "node", "index.js" ]
