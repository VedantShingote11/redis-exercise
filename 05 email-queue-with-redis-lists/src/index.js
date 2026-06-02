import express from 'express'
import Redis from 'ioredis'

const app = express();
app.use(express.json())

const redis = new Redis('redis://localhost:6379')
const KEY = "email:queue"

app.post('/send-email' , async (req , res) => {
    
    const job = {
        to : req.body.to,
        subject : req.body.subject || "No Subject",
        body : req.body.body || "No body",
        createdAt: new Date().toISOString()
    }

    await redis.lpush(KEY , JSON.stringify(job))

    res.json({"queued":true , job});

})

app.get('/emails/process-one' , async (req , res) => {
    
    const task = await redis.rpop(KEY);

    if(!task) {
        return res.status(404).json({"error": "No tasks available"});
    }

    const job = JSON.parse(task);

    // Simulate email sending
    res.json({"processed": true, job});

});
app.listen('3000' , ()=>{
    console.log("Server is running on http://localhost:3000")
})