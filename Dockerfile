FROM ubuntu:22.04

# create working directory
WORKDIR /app
# create volume for the dataset
VOLUME /app/nonrigid_dataset/
VOLUME /app/experiments/

# Install Git
RUN apt update && apt install -y git
RUN apt update && apt install ffmpeg libsm6 libxext6  -y

# Install Python
RUN apt update && apt install -y python3 python3-pip

# clone the repositories and install the requirements
ARG CACHEBUST=1
RUN git clone https://github.com/verlab/nonrigid-benchmark.git 

# # Install the requirements from the first repository
RUN pip3 install opencv-python scikit-image scikit-learn numpy matplotlib tqdm
RUN pip3 install -r nonrigid-benchmark/requirements.txt
RUN pip3 install -e nonrigid-benchmark/
# RUN python3 -m nonrigid_benchmark.evaluate --help

# # go to the website directory
# force to update the cache
RUN git clone https://github.com/felipecadar/nonrigid-benchmark-website.git
WORKDIR /app/nonrigid-benchmark-website

# Install nodejs
ENV NODE_VERSION=20.13.1
RUN apt install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version

# # Install the requirements from the second repository
RUN npm install prisma --save-dev
RUN npx prisma generate
RUN npm install
RUN npm install -g typescript
RUN npm install -g tsx

# copy .env
COPY .env /app/nonrigid-benchmark-website/.env
# # Run eval_server/database_monitor.js with node
# CMD ["npx", "tsx", "eval_server/database_monitor.js"]

# Run this command to build the image with:
# docker build -t eval_server .
# Get into the container with:
# docker run -it eval_server /bin/bash