FROM ubuntu:22.04

# create working directory
WORKDIR /app
# create volume for the dataset
VOLUME /app/nonrigid_dataset/
VOLUME /app/experiments/

# Install Git
RUN apt-get update && apt-get install -y git
RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

# clone the repositories and install the requirements
# ARG CACHEBUST=1
RUN git clone https://github.com/verlab/nonrigid-benchmark.git 

# # Install the requirements from the first repository
RUN pip3 install opencv-python scikit-image scikit-learn numpy matplotlib tqdm
RUN pip3 install -r nonrigid-benchmark/requirements.txt
RUN pip3 install -e nonrigid-benchmark/
# RUN python3 -m nonrigid_benchmark.evaluate --help
# root@2ed5047f6735:/app# python3 -m nonrigid_benchmark.evaluate --help
# usage: evaluate.py [-h] --input INPUT --output OUTPUT --dataset DATASET --split
#                    SPLIT [--matching_th MATCHING_TH] [--nproc NPROC] [--plot]

# options:
#   -h, --help            show this help message and exit
#   --input INPUT         Path to the matches file
#   --output OUTPUT       Path to the output file
#   --dataset DATASET     Path to the dataset root
#   --split SPLIT         Split to evaluate
#   --matching_th MATCHING_TH
#                         Matching threshold
#   --nproc NPROC         Parallel processors
#   --plot                Plot the results

# make an exec command to run the evaluation directly with docker

# ENTRYPOINT ["python3", "-m", "nonrigid_benchmark.evaluate"]
# CMD []

# Run this command to build the image with:
# docker build -t eval_server .
# Get into the container with:
# docker run -it eval_server /bin/bash