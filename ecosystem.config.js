module.exports = {
    apps: [
        {
            name: 'PushEngage-app2-producer',
            script: 'producer/cluster_main_producer.js',
            kill_timeout: 5000,
            wait_ready: true,
            listen_timeout: 10000,

            // Optional reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
            autorestart: true,
            watch: false,
            env_staging: {
                NODE_ENV: 'staging',
                DB_URL: 'mongodb://localhost:27017/pushengage-app2',
                PORT: 5005,
                AWS_ACCOUNT_ID: 'account-id-here',
                AWS_SQS_QUEUE_NAME: 'pushengage-notification-queue-staging',
                AWS_CONFIG_FILE_PATH: '/home/anmol/WebstormProjects/pushengage-app2/aws-config.json'
            },
            env_production: {
                NODE_ENV: 'production',
                DB_URL: 'mongodb://localhost:27017/pushengage-app2',
                PORT: 2443,
                AWS_ACCOUNT_ID: 'account-id-here',
                AWS_SQS_QUEUE_NAME: 'pushengage-notification-queue-production',
                AWS_CONFIG_FILE_PATH: '/home/anmol/WebstormProjects/pushengage-app2/aws-config.json'
            }
        },
        {
            name: 'PushEngage-app2-consumer',
            script: 'consumer/cluster_main_consumer.js',
            kill_timeout: 5000,
            wait_ready: true,
            listen_timeout: 10000,

            // Optional reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
            autorestart: true,
            watch: false,
            env_staging: {
                NODE_ENV: 'staging',
                DB_URL: 'mongodb://localhost:27017/pushengage-app2',
                PORT: 5010,
                AWS_ACCOUNT_ID: 'account-id-here',
                AWS_SQS_QUEUE_NAME: 'pushengage-notification-queue-staging',
                AWS_CONFIG_FILE_PATH: '/home/anmol/WebstormProjects/pushengage-app2/aws-config.json'
            },
            env_production: {
                NODE_ENV: 'production',
                DB_URL: 'mongodb://localhost:27017/pushengage-app2',
                PORT: 3443,
                AWS_ACCOUNT_ID: 'account-id-here',
                AWS_SQS_QUEUE_NAME: 'pushengage-notification-queue-production',
                AWS_CONFIG_FILE_PATH: '/home/anmol/WebstormProjects/pushengage-app2/aws-config.json'
            }
        }
    ],
};
