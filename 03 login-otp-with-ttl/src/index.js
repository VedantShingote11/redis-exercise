import express from 'express';
import Redis from 'ioredis';

const app = express();

app.use(express.json())

const redis = new Redis('redis://localhost:6379')

function otpKey(phone){
    return `otp:${phone}`
}

app.post('/otp' , async (req,res)=>{
    const {phone} = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    await redis.set(otpKey(phone) , otp , 'EX' , 30) // Set ttl to 30 seconds

    res.json({success: true, message: 'OTP sent successfully' , otp})
});

app.post('/otp/verify' , async (req,res)=>{
    const {phone , otp} = req.body;
    const storedOtp = await redis.get(otpKey(phone))

    if(!storedOtp){
        return res.status(400).json({success: false, message: 'OTP expired or not found'})
    }

    if(storedOtp != otp){
        return res.status(400).json({success: false, message: 'Invalid OTP'})
    }

    await redis.del(otpKey(phone)) // Delete OTP after successful verification
    res.json({success: true, message: 'OTP verified successfully'})
});

app.get('/otp/:phone/ttl' , async (req,res)=>{
    const ttl = await redis.ttl(otpKey(req.params.phone))
    res.json({success: true, ttl})
});

app.get('/test' , async (req,res)=>{
    res.json({success: true, message: 'Test endpoint is working'})
});

app.listen('3000' , ()=>{
    console.log("Server is running on http://localhost:3000")
})