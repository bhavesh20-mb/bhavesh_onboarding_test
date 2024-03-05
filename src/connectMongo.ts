import mongoose from 'mongoose';
import dbConfig from './database/config';

const connectMongo = () => {
    console.log('connecting to mongodb...');

    // const connect = mongoose.connect(dbConfig.url);
    const connect = mongoose.connect('mongodb://127.0.0.1:27017/hectordapp');

    const env = process.env.NODE_ENV || 'development';
    const debug = env === 'development';
    mongoose.set('debug', debug);

    const db = mongoose.connection;

    db.on('error', console.error.bind(console, 'connection error:'));

    db.once('open', () => {
        console.log('connected to mongodb');
    });

    return connect;
};

export default connectMongo;
