import {Worker} from 'bullmq';
import {connection} from './queue.js';

console.log('Worker is running...');

const worker = new Worker(
    'emails',
    async job => {
        const { to, subject, body } = job.data;
        console.log(`Sending email to ${to} with subject "${subject}" and body "${body}"`);
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log(`Email sent to ${to}`);
    },
    { connection }
);

worker.on('completed', job => {
    console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
});