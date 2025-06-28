APP_HOST="https://senai-express-postgres.vercel.app"
export APP_HOST
bash ./requests/reset.sh
bash ./requests/registro_ok.sh
bash ./requests/registro_falha.sh
bash ./requests/login_falha.sh
TOKEN=$(bash ./requests/login_ok.sh | tee /dev/tty | tail -n1 | sed -E 's/.*"token":"([^"]+)".*/\1/')
bash ./requests/protected_falha.sh
bash ./requests/protected_ok.sh $TOKEN
