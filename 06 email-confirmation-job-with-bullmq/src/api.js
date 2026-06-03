import express from 'express';
import Redis from 'ioredis';
import {emailQueue} from './queue.js';

const app = express();
app.use(express.json());

app.post('/send-email', async (req, res) => {
    console.log('Received email request:', req.body);
    const job = await emailQueue.add(
        "send-email",
        {
            to: req.body.to,
            subject: req.body.subject,
            body: req.body.body
        },
        {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
        }
    );

    res.json({ jobId: job.id });
});

app.listen(3000, () => {
    console.log('server is running on http://localhost:3000');
});