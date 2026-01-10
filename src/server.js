const express = require('express');
const app =require("./app");
const client=require("./config/databasepg");

const port = process.env.PORT || 5001;

client.query(`Select NOW()`,(err,res)=>{
    if(err){
        console.log("DB is not Connected");
    }
    else{
        console.log("DB is Connected");
    }
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
