FROM debian:latest

RUN apt-get install -y python g++ make checkinstall fakeroot wget

RUN mkdir /build-node
WORKDIR   /build-node

RUN wget -N http://nodejs.org/dist/v0.10.28/node-v0.10.28.tar.gz
RUN tar xzvf node-v0.10.28.tar.gz
WORKDIR /build-node/node-v0.10.28

RUN /build-node/node-v0.10.28/configure
RUN make
RUN fakeroot checkinstall -y --install=no --pkgversion 0.10.28 make install
RUN dpkg -i node_0.10.28-1_amd64.deb

