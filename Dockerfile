FROM node:12

#use this as the working directory in container... the RUN CMD ENTRYPOINT ADD commands will run in here
WORKDIR /usr/src/app 

#COPY from <src> to <dest> ... here the <dest> is reltive to the WORKDIR and <src> is the build context directory
COPY . .

# RUN is triggered when the image is being built
RUN npm install

ENV PORT=3000
EXPOSE ${PORT}
ENV MONGO_HOST=mongo-server-v1
ENV MONGO_PORT=27017
ENV MONGO_USER=yelpUser
ENV MONGO_PASSWORD=yelpPwd
ENV MONGO_DB_NAME=yelp-db

# CMD is triggered when the container is started
CMD [ "npm", "start" ]
