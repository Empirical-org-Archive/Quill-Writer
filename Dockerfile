FROM empirical/node_base:latest

RUN apt-get install -y libzmq-dev

ADD . /app
RUN cd /app; npm install

ENV PORT 80

WORKDIR /app
CMD /app/launch.sh
