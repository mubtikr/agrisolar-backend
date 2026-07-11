FROM eclipse-mosquitto:latest
COPY config/mosquitto.conf /mosquitto/config/mosquitto.conf
RUN chown -R 1883:1883 /mosquitto/config /mosquitto/data /mosquitto/log
