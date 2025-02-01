const express=require('express')
const path=require('path')
const app=express()
const mongoose=require('mongoose')
const { timeStamp } = require('console')
const { type } = require('os')

const port=3000
let currentpost=1

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(
    "mongodb+srv://priyanshu:Ppriyanshu%401407@priyanshucluster.kzr7x.mongodb.net/CuConfession?retryWrites=true&w=majority&appName=PriyanshuCluster",
    { serverSelectionTimeoutMS: 20000 }
  )
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/",(req,res)=>{
    res.render('index')
})



// schema and model for confession
const confessionScheme=new mongoose.Schema({
  type:String,
  postnumber:Number,
  likes:{type:Number,default:0},
  message:String,
  timeStamp:{type:Date,default:Date.now}
})
const confession=mongoose.model("confession",confessionScheme)

// schema and model for poll
const pollSchema=new mongoose.Schema({
  type:String,
  postnumber:Number,
  likes:{type:Number,default:0},
  question:String,
  option1:String,
  option2:String,
  option3:String,
  option4:String,
  timeStamp:{type:Date,default:Date.now}
})
const poll =mongoose.model("poll",pollSchema)

// schema and model for meme
// will be made later


// for postdiv post request
app.post('/postdiv',(req,res)=>{
  // console.log(req.body)
  const {type ,...rest}=req.body
  console.log(rest)
  switch(type){
    case "PostConfession":
      const {message}=rest;
      try {
        const Confession=new confession({
          type:type,
          postnumber:currentpost,
          message:message,
        })
        Confession.save();
        return res.status(200);
      } catch (error) {
        return res.status(400).send(error)
      }
      break;
    case "PostPoll":
      const {pollquestion,option1,option2,option3,option4}=rest;
      try {
        const Poll =new poll({
          type:type,
          postnumber:currentpost,
          question:pollquestion,
          option1:option1,
          option2:option2,
          option3:option3,
          option4:option4,
        })
        Poll.save()
        return res.status(200);
      } catch (error) {
        return res.status(400).send(error)
      }
      break;
      
  }
  currentpost++;
  res.redirect("/")
})

// for postrequest to send the type of post data
app.post("/postrequest",async(req,res)=>{
  const posttype=req.body.type
  try {
    if(posttype=="All"){
      console.log("will be build soon")
    }
    else if(posttype=="Confession"){
      const post=await confession.find()
      if(post.length>0){
        return res.status(200).json(post)
      }
      else{
        return res.status(100).json({message:"No post found!"})
      }
    }
    else if(posttype=="Polls"){
      const post=await poll.find()
      if(post.length>0){
        return res.status(200).json(post)
      }
      else{
        return res.status(100).json({message:"No post found!"})
      }
    }
    else if(posttype=="Meme"){
      return res.status(100).json({ message: "Meme feature will be built soon!" });
    }
  } catch (error) {
    return res.status(400).json({ error: "Invalid post type!" });
  }
})

app.listen(port,()=>{
    console.log(`Listening on port ${port}`)
})