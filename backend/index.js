const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const timeNew = require('./outputs/time');

const { generateFile } = require('./generateFile');
const { executeCpp } = require('./executeCpp');
const { executePy } = require('./executePy');
const Job  = require('./models/job');

mongoose.connect('mongodb://localhost:27017/compilerapp',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, (err) => {
    if(err) {
        console.log(err);
        process.exit(1);
    }
    console.log("Successfully connected to mongoDB database! ")
});

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const cors_options = {
    origin: ["http://localhost:3001","http://127.0.0.1:3001"],
    optionsSuccessStatus: 200,
}

app.use(cors());

app.get('/', (req, res) => {
    return res.json({hello : "world"});
});

app.post('/run', async (req, res) => {
    const {language, code} = req.body;
    console.log(language, code.length);

    if (code === undefined) {
        return res.status(400).json({ success: false, error: 'Empty code body' });
        process.exit(1)
    }

    let job = {}; //initialized empty var as dictionary.

    try{
        // we need to generate a c++ file with content from the request
        let output;
        job["startedAt"] = new Date();

        const filepath =  await generateFile(language, code);
        job = await new Job({language,filepath}).save();
        const jobId = job["_id"];
        console.log("Job:",job);

        // we need to run the file and send the response
        if (language === "cpp") {
            output =  await executeCpp(filepath);
        } else if (language==="py") {
            output =  await executePy(filepath);
        }else{
            output = "You did not specify language";
        }

        job["completedAt"] = timeNew;
        job["status"] = "success";
        job["output"] = output;
        // job["language"] = language;

        await job.save();

        console.log("JOB DETAILS: ",job);
        res.status(201).json({success:true, job})
        // console.log({filepath, output});
        // return res.json({ filepath, output });
    } catch(err) {
        let output;
        let job = {};

        job["startedAt"] = new Date();
        const filepath =  await generateFile(language, code);
        job = await new Job({language,filepath}).save();

        job["completedAt"] = timeNew;
        job["status"] = "error";
        job["output"] = JSON.stringify(err);

        await job.save();

        res.status(500).json({success:false,job,err});
    }
});
const port = 5550;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})