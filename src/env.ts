import envalid, { str, host, port } from 'envalid'

const env = envalid.cleanEnv(process.env, {
    TELEGRAM_TOKEN: str(),
    DB_HOST: host(),
    DB_USER: str(),
    DB_PASSWORD: str(),
    DB_NAME: str()
})

export default env