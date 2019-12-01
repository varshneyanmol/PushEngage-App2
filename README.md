# PushEngage-App2

## Assumptions:
1.  Mongo Shard server is running on localhost on port 27017 with no security (for simplicity).
2.  Application uses PM2 as its process manager. So PM2 is required to run it.
3.  Browser sends "notification_id", "site_id" and "subscriber_id" every time it wants the backend to record the views/clicks data.
4.  SQS Queue with the name "pushengage-notification-queue-staging" or "pushengage-notification-queue-production" are already created corresponding to the environment staging and production respectively.

**There are two applications running in PushEngage-App2:**

**1.  Producer app**

    1.  Runs in cluster mode similar to PushEngage-App1.
    2.  Differences between PushEngage-App1 and PushEngage-App2-Producer-App:
        1.  POST request to store view/click data now pushes the data on to the SQS Queue rather than directly storing in into mongogb
        2.  in production mode, number of workers = 1/2 of available logical CPUs.
        3.  in staging mode number of workers = 2 
    
**2. Consumer app**

    1.  Runs in cluster mode:
        1.  in production mode, number of workers = 1/2 of available logical CPUs.
        2.  in staging mode number of workers = 2
    2.  The only job of every worker is to fetch data from AWS SQS queue and insert it into mongodb. And keep repeating this task.


Bucket name, AWS credentials, mongodb url etc. all of this can be changed from ecosystem.config.js file.
Major difference between APP-1 and APP-2 is that APP-2 is decoupled with the help of SQS service.

Producer-app generates the messages which are to be consume by the Consumer-app;
So, if we run "pm2 start ecosystem.config.js --env staging|production", 2 independent applications will run.
