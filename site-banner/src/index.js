import express from 'express';
import Redis from 'ioredis';

const app = express();
app.use(express.json());

const redis = new Redis('redis://localhost:6379');

const BANNER_KEY = 'app:banner';

app.post('/banner' , async(req , res)=>{
    const val = await req.body;
    await redis.set(BANNER_KEY , val.val || 'Welcome');
    return res.json({success : true });
})
app.get('/banner' , async(req , res)=>{
    const value = await redis.get(BANNER_KEY);
    return res.json({success : true , value});
})
app.delete('/banner' , async (req , res) => {
    const del = await redis.del(BANNER_KEY);
    return res.json({success : true});
})
app.get('/banner/exist' , async (req , res) => {
    const exist = await redis.exists(BANNER_KEY);
    return res.json({success:true , message:Boolean(exist)});
})

app.listen(3000,()=>{
    console.log('Server is running on port http://localhost:3000');
})