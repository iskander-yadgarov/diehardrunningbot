import Mongoose from 'mongoose'
import env from '../env'

let database: Mongoose.Connection

const connectionURL = `mongodb+srv://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}/${env.DB_NAME}?retryWrites=true&w=majority`

function connect(completion: (error?: Error) => void) {
    if (database) { 
        console.log('database already connected')
        completion(Error())
        return 
    }

    Mongoose.connect(connectionURL, {
        useNewUrlParser: true,
        useFindAndModify: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        autoIndex: env.isDevelopment
    })

    database = Mongoose.connection

    database.once('open', () => {
        console.log('connected to database')
        completion()
    })

    database.on('error', (error) => {
        console.log(`error connecting to database: ${error}`)
        completion(error)
    })
}

function disconnect() {
    if (!database) {
        console.log('trying to disconnect database without connection')
        return 
    }

    Mongoose.disconnect()
}

export default { connect, disconnect }