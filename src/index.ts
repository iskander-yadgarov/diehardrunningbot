import { launch } from "./bot"
import db from './db'
import './extensions/date.extension'
import "./extensions/string.extension"
import express from 'express'
// Create a new express app instance
const app: express.Application = express();

app.get(`/`, function (req, res) {
    res.send(`Hello World!`);
});

app.listen(process.env.PORT || 3000, function () {
    console.log(`App is listening on port 3000!`);
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

db.connect((error) => {
    if (error !== undefined) {
        console.log('failed connect to database' + error)
        process.exit(1)
    }

    launch()
})