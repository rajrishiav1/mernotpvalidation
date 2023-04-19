require("dotenv").config();
const express = require ("express");
const app= express();
const cors= require("cors");
const PORT = process.env.PORT || 4002;
const router = require("./Routes/router")
require("./db/conn");

//middleware
app.use(express.json());
app.use(cors());
app.use(router);

app.listen(PORT,()=>{
console.log(`server start at port number : ${PORT}`);
})

app.get("/",(req,res)=>{
    res.status(200).json("server started")
})