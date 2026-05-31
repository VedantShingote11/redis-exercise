import express from 'express';
import Redis from 'ioredis';

const app = express()

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.get('/test' , (req , res)=>{
    res.json({message : "App is running"})
})
app.get('/redis' , async (req , res)=>{
    const reply = await redis.ping();
    res.json({message : reply})
})

app.listen(5000 , ()=>{
    console.log("server is running on port http://localhost:5000");
})