import express, { json } from 'express'
import Redis from 'ioredis'

const app = express();

app.use(express.json());

const redis = new Redis("redis://localhost:6379")

function getKey(id , type){
    return `user:${id}:${type}`
}

// Saving user profile in JSON format

app.post('/save-profile/json' , async (req , res) => {
    const {id ,user_name , email} = req.body;
    await redis.set(getKey(id , "json") , JSON.stringify({id , user_name , email}));

    res.json({success : true});
})

app.get('/get-profile/:id/json' , async (req , res) => {
    const{id} = req.params;
    const data = await redis.get(getKey(id , "json"));

    if(!data){
        return res.json({success : false , message : "Profile not found"})
    }

    res.json({success : true , savedAs : "json" , data : JSON.parse(data)})
})

// Saving user profile in Hash format

app.post('/save-profile/hash' , async (req , res) => {
    const {id} = req.body;
    await redis.hset(getKey(id , "hash") , req.body)

    res.json({success : true , savedAs:"hash"})
})

app.get('/get-profile/:id/hash' , async (req , res) => {
    const{id} = req.params;
    const profile = await redis.hgetall(getKey(id , "hash"));

    if(!profile || Object.keys(profile).length === 0){
        return res.json({success : false , message : "Profile not found"})
    }

    res.json({success:true ,data:profile})
})

app.listen('3000' , ()=>{
    console.log("Server is running on http://localhost:3000")
})