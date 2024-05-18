FROM ubuntu:22.04

# Install Git
RUN apt-get update && apt-get install -y git

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

# Install nodejs
RUN apt-get update && apt-get install -y nodejs npm

# create working directory
WORKDIR /app
# create volume for the dataset
VOLUME /app/nonrigid_dataset/

# clone the repositories and install the requirements
RUN git clone https://github.com/felipecadar/nonrigid-benchmark.git 
RUN git clone https://github.com/felipecadar/nonrigid-benchmark-website.git

# # Install the requirements from the first repository
RUN pip3 install -r nonrigid-benchmark/requirements.txt
RUN pip3 install -e nonrigid-benchmark/

# # test the installation by running python -m nonrigid_benchmark.evaluate --help
RUN python3 -m nonrigid_benchmark.evaluate --help

# # go to the website directory
WORKDIR /app/nonrigid-benchmark-website

# # Install the requirements from the second repository
RUN npm install prisma --save-dev

# # Run eval_server/database_monitor.js with node
CMD ["node", "eval_server/database_monitor.js"]


# Run this command to build the image with:
# docker build -t eval_server -f Dockerfile.eval_server .
# Get into the container with:
# docker run -it eval_server /bin/bash