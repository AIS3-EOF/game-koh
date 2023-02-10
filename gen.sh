openssl req -new -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -x509 -nodes -days 365 -out server.cert -keyout server.key -subj '/CN=game-koh'
