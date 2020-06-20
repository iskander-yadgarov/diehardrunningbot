import { launch } from "./bot"
import db from './db'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

db.connect((error) => {
    if (error !== undefined) {
        console.log('failed connect to database' + error)
        process.exit(1)
    }

    launch()
})