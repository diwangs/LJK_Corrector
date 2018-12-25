let config = {
    'development': {
        serverUrl: 'http://localhost:5000',
    },
    'production': {
        serverUrl: 'http://103.216.223.11:18501',
    },
}

let env = process.env.NODE_ENV || 'development';

export default config[env];