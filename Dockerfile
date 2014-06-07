FROM empirical/node_base:latest

RUN apt-get install -y libzmq-dev
ADD . /app
RUN cd /app; npm install

ENV PORT 80
CMD /app/launch.sh

