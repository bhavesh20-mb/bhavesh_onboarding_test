const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_PORT, DB_NAME } = process.env;

const dbConfig = {
    url: `mongodb://${DB_USERNAME}:${encodeURIComponent(DB_PASSWORD!)}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
};

export default dbConfig;
