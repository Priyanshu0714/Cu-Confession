const express=require('express')
const path=require('path')
const app=express()
const mongoose=require('mongoose')

const port=3000

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(
    "mongodb+srv://priyanshu:Ppriyanshu%401407@priyanshucluster.kzr7x.mongodb.net/TravelMate?retryWrites=true&w=majority&appName=PriyanshuCluster",
    { serverSelectionTimeoutMS: 20000 }
  )
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/",(req,res)=>{
    res.render('index')
})

// for postdiv post request
app.post('/postdiv',(req,res)=>{
    // console.log(req.body)
    const {type ,...rest}=req.body
    switch(type){
      case "PostConfession":
        const {message}=rest;
        break;
      case "PostPoll":
        
    }
    res.redirect("/")
})

app.listen(port,()=>{
    console.log(`Listening on port ${port}`)
})