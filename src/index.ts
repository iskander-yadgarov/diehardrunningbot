import { launch } from "./bot"
import db from './db'
import './extensions/date.extension'
import "./extensions/string.extension"

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const express = require('express')
const expressApp = express()

const port = process.env.PORT || 3000
expressApp.get('/', (req: any, res: any) => {
  res.send('It is Die Hard Core!')
})
expressApp.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

db.connect((error) => {
    if (error !== undefined) {
        console.log('failed connect to database' + error)
        process.exit(1)
    }

    launch()
})