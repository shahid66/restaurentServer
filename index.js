const express =require('express');
const { readdirSync } = require("fs");
const cors =require('cors');
const mongoose=require('mongoose');

const errorHandlear = require('./middleware/errorMiddleware');
const cookieParser = require('cookie-parser')
const dotenv=require('dotenv').config();
const app=express()
const helmet = require('helmet');
const path = require("path");



app.use(cors())
// app.use(cors({credentials:true, origin:'http://localhost:3000'}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(helmet())
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use(router)

// routes middleware
readdirSync("./routes").map(r => app.use("/api/v1", require(`./routes/${r}`)))

const PORT=process.env.PORT || 5000;
app.use(errorHandlear)
mongoose.connect(process.env.DATABASE).then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}`)
    })
})
