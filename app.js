const express=require('express')
const path=require('path')
const app=express()
const mongoose=require('mongoose')
const multer=require('multer')
const rateLimit = require('express-rate-limit');

// const likeupdate=require("./updatelike.js")

mongoose
  .connect(
    "mongodb+srv://priyanshu:Ppriyanshu%401407@priyanshucluster.kzr7x.mongodb.net/CuConfession?retryWrites=true&w=majority&appName=PriyanshuCluster",
    { serverSelectionTimeoutMS: 20000 }
  )
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

const port=3000
let currentpost=1
// for ddos protection 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});
app.use(limiter);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "uploads")));
// for like updating in files.

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// multer storage 
const storage=multer.diskStorage({
  destination:"uploads/",
  filename:(req,file,cb)=>{
    cb(null,Date.now()+"-"+file.originalname);
  },
})
const upload =multer({storage})



app.get("/",(req,res)=>{
    res.render('index')
})

app.get("/uploads/:filename",(req,res)=>{
  const imagefilepath=path.join(__dirname,"uploads",req.params.filename)
  res.sendFile(imagefilepath)
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
  option1choice:{type:Number,default:0},
  option2choice:{type:Number,default:0},
  option3choice:{type:Number,default:0},
  option4choice:{type:Number,default:0},
  timeStamp:{type:Date,default:Date.now}
})
const poll =mongoose.model("poll",pollSchema)

// schema and model for meme
// will be made later


// for postdiv post request
app.post('/postdiv',(req,res)=>{
  // console.log(req.body)
  const {type ,...rest}=req.body
  // console.log(rest)
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
        return res.status(200).json({success:true});
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

// schemas and model for image
const imageschema=new mongoose.Schema({
  type:{type:String,default:"Postimage"},
  imageurl:String,
  caption:String,
  likes:{type:Number,default:0},
  timeStamp:{type:Date,default:Date.now}
})
const image=mongoose.model("image",imageschema)
// for image div
app.post("/imageupload",upload.single("image"),(req,res)=>{
  if(!req.file){
    return res.status(400).json({message:"No file uploaded"})
  }
  const Image=new image({
    imageurl:req.file.path,
    caption:req.body.imagecaption
  })
  Image.save();
  res.json({success:true,message:"File uploaded",fileurl:`/uploads/${req.file.filename}`});
})

// for postrequest to send the type of post data
app.post("/postrequest", async (req, res) => {
  const posttype = req.body.type;
  const offset = parseInt(req.body.offset) || 0; // Default offset to 0 if not provided
  const limit = parseInt(req.body.limit) || 5;  // Default limit to 5 if not provided

  try {
    let posts = [];

    if (posttype === "All") {
      const confessions = await confession.find().sort({ timeStamp: -1 }).skip(offset).limit(limit);
      const polls = await poll.find().sort({ timeStamp: -1 }).skip(offset).limit(limit);
      const pictures=await image.find().sort({timeStamp:-1}).skip(offset).limit(limit);

      // Combine the confessions and polls and sort them based on timeStamp
      posts = [...confessions, ...polls,...pictures].sort((a,b) =>b.timeStamp - a.timeStamp);
    } 
    else if (posttype === "Confession") {
      posts = await confession.find().sort({ timeStamp: -1 }).skip(offset).limit(limit);
    } 
    else if (posttype === "Polls") {
      posts = await poll.find().sort({ timeStamp: -1 }).skip(offset).limit(limit);
    } 
    else if (posttype === "Meme") {
      posts=await image.find().sort({timeStamp:-1}).skip(offset).limit(limit);
    } 
    else {
      return res.status(400).json({ error: "Invalid post type!" });
    }

    // Send response only once
    if (posts.length > 0) {
      return res.status(200).json(posts);
    } else {
      return res.status(200).json({ message: "No posts found!" });
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

// for likes updating
// app.use("/updatelikes",likeupdate)
app.post("/updatelikes",(req,res)=>{
    const id=req.body.id;
    const type=req.body.type
    // console.log(type)
    update(id,type)
    return res.status(200).json({success:true})
})
async function update(id,type){
    if(type=="PostConfession"){
        const update= await confession.findByIdAndUpdate(id,
            {$inc:{likes:1}},
            {new:true},
        );
    }
    else if(type=="PostPoll"){
      const update= await poll.findByIdAndUpdate(id,
          {$inc:{likes:1}},
          {new:true},
      );
  }
    else if(type=="Postimage"){
      const update= await image.findByIdAndUpdate(id,
          {$inc:{likes:1}},
          {new:true},
      );
    }
}

// this part is for calculateEngagement
app.post("/calculateEngagement",async (req,res)=>{
  try {
    if(req.body.type==="a"){
      const update=await poll.findByIdAndUpdate(req.body.id,
        {$inc:{option1choice:1}},
        {new:true}
      )
    }
    else if(req.body.type==="b"){
      const update=await poll.findByIdAndUpdate(req.body.id,
        {$inc:{option2choice:1}},
        {new:true}
      )
    }
    else if(req.body.type==="c"){
      const update=await poll.findByIdAndUpdate(req.body.id,
        {$inc:{option3choice:1}},
        {new:true}
      )
    }
    else if(req.body.type==="d"){
      const update=await poll.findByIdAndUpdate(req.body.id,
        {$inc:{option4choice:1}},
        {new:true}
      )
    } 
    const data=await poll.findById(req.body.id)
    return res.status(200).json({data:data})
    
  } catch (error) {
    res.status(400).json({success:false,message:"unable to fetch data"})
  }
})

app.listen(port,()=>{
    console.log(`Listening on port ${port}`)
})