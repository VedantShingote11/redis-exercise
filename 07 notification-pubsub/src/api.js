import express from 'express';
import Redis from 'ioredis';

const app = express();
app.use(express.json());

const publisher = new Redis('redis://localhost:6379');

app.post('/notifications', (req, res) => {
    const { message } = req.body;
    publisher.publish('notifications', message);
    res.json({ status: 'Message published' });
});

app.listen(3000, () => {
    console.log('server is running on port 3000');
});