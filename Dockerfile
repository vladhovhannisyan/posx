FROM node:10.16
ARG DB_URL
ENV PORT=80
COPY ./api /app/api
COPY ./models /app/api/models
COPY ./utils app/api/utils
COPY ./webhook /app/webhook
COPY ./models /app/webhook/models
COPY ./utils app/webhook/utils
COPY ./worker /app/worker
COPY ./models /app/worker/models
COPY ./utils app/worker/utils
WORKDIR /app
RUN cd worker && npm install
RUN cd webhook && npm install
RUN cd api && npm install
EXPOSE 80
CMD [ "node","api/app.js" ]
