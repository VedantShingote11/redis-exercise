import express from "express";
import cors from "cors";
import { redis } from './config/redis.js'

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const leaderboardKey = 'quiz_leaderboard';
const userNamesKey = 'quiz_usernames';
const getUserKey = (userId) => `user:${userId}`;

app.get('/clear-storage', async (req, res) => {
    try {
        await redis.del(leaderboardKey);
        await redis.del(userNamesKey);
        res.json({ message: 'Storage cleared successfully' });
    } catch (error) {
        console.error("Error occurred while clearing storage", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

app.post('/update-rank', async (req, res) => {
    try {
        const { userId, userName, points } = req.body;

        if (userName) {
            await redis.hset(userNamesKey, getUserKey(userId), userName);
        }

        await redis.zincrby(leaderboardKey, points, getUserKey(userId));

        const pos = await redis.zscore(leaderboardKey, getUserKey(userId));

        console.log(`Updated points for user ${userName} (ID: ${userId}): ${pos} points`);

        res.json({ success: true, pos })
    } catch (error) {
        console.log("Error occurred while updating rank", error);
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
})

app.get('/leaderBoard', async (req, res) => {
    try {
        const topCandidates = await redis.zrevrange(leaderboardKey, 0, 9, 'WITHSCORES');

        const formattedCandidates = [];

        for (let i = 0; i < topCandidates.length; i += 2) {
            const userId = topCandidates[i];
            const points = topCandidates[i + 1];
            const userName = await redis.hget(userNamesKey, userId);
            formattedCandidates.push({ userId, userName, points })
        }

        res.json({ success: true, topCandidates: formattedCandidates })
    } catch (error) {
        console.log("Error occurred while fetching leaderboard", error);
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
})

app.get('/leaderBoard/:userId/rank', async (req, res) => {
    try {
        const { userId } = req.params;
        const rank = await redis.zrevrank(leaderboardKey, getUserKey(userId));

        if (rank === null) {
            return res.json({ success: false, message: "User not found in leaderboard" })
        }

        res.json({ success: true, rank: rank + 1 })
    } catch (error) {
        console.log("Error occurred while fetching user rank", error);
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
