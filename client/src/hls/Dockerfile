FROM alpine:latest

RUN apk update && apk add --no-cache ffmpeg

WORKDIR /home/app

COPY main.sh /home/app/main.sh

RUN chmod +x /home/app/main.sh

CMD ["./main.sh"]

