FROM node:10-alpine
MAINTAINER iam@lowiehuyghe.com

# Install bind
RUN apk add --no-cache bind

# Setup source code
WORKDIR /opt/name-com-slave-dns
COPY . .
RUN npm ci --only=production

# Setup cron
RUN echo '*  *  *  *  *    cd /opt/name-com-slave-dns && npm start > /dev/null' > /var/spool/cron/crontabs/root

# Data
ENV CONFIG /data/config.js
ENV TOKEN mytoken1234567890
VOLUME ["/data"]

# Expose
EXPOSE 53

# Run the command on container startup
CMD npm start > /dev/null && crond -f -l 9
