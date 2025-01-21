FROM mongo:6.0.20

RUN apt-get update &&  \
    apt-get install -y gnupg wget curl && \
    curl -sL https://repo.mongodb.org/apt/ubuntu/dists/jammy/mongodb-org/6.0/multiverse/binary-amd64/mongodb-org-server_6.0.20_amd64.deb -o /tmp/mongodb-org-server_6.0.20_amd64.deb && \
    dpkg -i /tmp/mongodb-org-server_6.0.20_amd64.deb && \
    rm /tmp/mongodb-org-server_6.0.20_amd64.deb && \
    apt-get install -f -y && \
    apt-get clean
