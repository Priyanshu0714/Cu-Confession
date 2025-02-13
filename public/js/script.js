let lastClickedButton = null;
let offset=0
const limit=5
let loading=false;

function handleclick(buttonText) {
  offset=0;
  const buttonid = document.getElementById(buttonText.trim());
  const postdiv = document.getElementById("PostType");
  if (lastClickedButton && lastClickedButton !== buttonid) {
    lastClickedButton.classList.remove("bg-black");
  }

  buttonid.classList.add("bg-black");
  lastClickedButton = buttonid;
  postdiv.innerHTML = "";

  switch (buttonText) {
    case "All":
      // console.log("all");
      postrequest(buttonText);
      break;
    case "Confession":
      // console.log("confession");
      postrequest(buttonText);
      break;
    case "Polls":
      // console.log("polls");
      postrequest(buttonText);
      break;
    case "Meme":
      postrequest(buttonText);
      // console.log("meme");
      break;
  }
}
// for default click
document.getElementById("All").click();

const CreatePostDiv = document.getElementById("CreatePostDiv");
document.getElementById("CreatePost").addEventListener("click", () => {
  CreatePostDiv.classList.replace("hidden", "flex");
});
document.getElementById("createpostclose").addEventListener("click", () => {
  CreatePostDiv.classList.replace("flex", "hidden");
});

// for getting the input fields
let message = null;
let question = null;
let option1 = null;
let option2 = null;
let option3 = null;
let option4 = null;

// for handling the createpost type
let CreatepostLastClick = null;
function CreatePostHandle(type) {
  const buttonid = document.getElementById(type);
  const postdiv = document.getElementById("PostTextArea");

  if (CreatepostLastClick && CreatepostLastClick !== buttonid) {
    CreatepostLastClick.classList.remove("bg-black");
  }
  buttonid.classList.add("bg-black");
  CreatepostLastClick = buttonid;
  postdiv.innerHTML = "";

  switch (type) {
    case "PostConfession":
      postdiv.innerHTML =
        '<textarea id="confessiontext" class="w-full h-28 bg-black rounded-md p-2 text-sm text-white outline-none border-2 border-[#262629]" name="message" placeholder="Write your Confession 💕" required></textarea>';
      break;
    case "PostPoll":
      postdiv.innerHTML =
        '<div class="flex flex-col gap-3"><input class="rounded-md h-10 outline-[#262629] outline-offset-2 bg-black border-2 border-[#262629] py-1 px-2 text-gray-300" type="text" name="pollquestion" id="pollquestion" placeholder="Poll Question 🧐" required><input class="rounded-md h-10 outline-[#262629] outline-offset-2 bg-black border-2 border-[#262629] py-1 px-2 text-gray-300" type="text" name="option1" id="option1" placeholder="Option 1" required><input class="rounded-md h-10 outline-[#262629] outline-offset-2 bg-black border-2 border-[#262629] py-1 px-2 text-gray-300" type="text" name="option2" id="option2" placeholder="Option 2" required><input class="rounded-md h-10 outline-[#262629] outline-offset-2 bg-black border-2 border-[#262629] py-1 px-2 text-gray-300" type="text" name="option3" id="option3" placeholder="Option 3" required><input class="rounded-md h-10 outline-[#262629] outline-offset-2 bg-black border-2 border-[#262629] py-1 px-2 text-gray-300" type="text" name="option4" id="option4" placeholder="Option 4" required></div>';
      break;
    case "PostMeme":
      postdiv.innerHTML =
        '<div class="space-y-3"><input type="file" id="memeimg" name="image" required><input class="w-full rounded-md h-10 outline-[#262629] outline-offset-2 bg-black border-2 border-[#262629] py-1 px-2 text-gray-300" type="text" name="memecaption" id="memecaption" placeholder="Caption 😎" required></div>';
      break;
    default:
      console.log("Some error occurred!!");
  }

  const form = document.getElementById("postdivform");
  form.removeEventListener("submit", handleFormSubmit); // Remove old listener if exists
  form.addEventListener("submit", handleFormSubmit); // Attach new listener
}

async function handleFormSubmit(event) {
  event.preventDefault();
  document.getElementById("CreatePostDiv").classList.replace("flex","hidden")
  const div=document.getElementById("PostType")
  // location.reload()
  if (CreatepostLastClick.id === "PostConfession") {
    const messageInput = document.getElementById("confessiontext");
    if (messageInput) {
      // before sending to backend making sure to append it to the front end
      const message = messageInput.value.trim();
      document.getElementById("confessiontext").value = "";
      await sendrequest("PostConfession", message);
    }
  } else if (CreatepostLastClick.id === "PostPoll") {
    const pollfields = ["pollquestion", "option1", "option2", "option3", "option4"];
    const pollData = {};

    let allFieldsExist = true;
    pollfields.forEach((id) => {
      const field = document.getElementById(id);
      if (field) {
        pollData[id] = field.value.trim();
      } else {
        allFieldsExist = false;
      }
    });

    if (allFieldsExist) {
      pollfields.forEach((id) => {
        document.getElementById(id).value = "";
      });
      await sendrequest("PostPoll", pollData);
    }
  }
  else if(CreatepostLastClick.id==='PostMeme'){
    const imageinput=document.getElementById("memeimg").files[0]
    const imagecaption=document.getElementById("memecaption").value

    if(!imageinput){
      return;
    }
    await imageupload("Memecaption",{image:imageinput,imagecaption});
  }
}
// fetch request to send image files
async function imageupload(type, data) {
  const formData = new FormData();
  formData.append("type", type);

  for (const key in data) {
      formData.append(key, data[key]);
  }

  const response = await fetch("/imageupload", {
      method: "POST",
      body: formData,
  });

  if (response.ok) {
      document.getElementById("memeimg").value="";
      document.getElementById("memecaption").value=""
  } else {
      console.log("Some error occurred");
  }
}


// function to send fetch request
async function sendrequest(type, data) {
  //   const message = document.getElementById("confessiontext");
  const response = await fetch("/postdiv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      typeof data === "string" ? { type, message: data } : { type, ...data }
    ),
  });
  const dataresponse=await response.json()
  if (dataresponse.ok) {
    console.log("successfully sent the data");
    return
  } else {
    console.log("some error occured");
    return
  }  
}



// function to send fetch request for getting post type

async function postrequest(type) {
  if (loading) return;
  loading = true;

  try {
    const response = await fetch("/postrequest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: type,
        offset,
        limit,
      }),
    });
    const data = await response.json();

    if (!response.ok || !Array.isArray(data)) {
      console.log("No more posts to load or some error occurred");
      loading = false;
      return;
    }

    data.forEach(item => {
      appendData(item.type, item);
    });
    offset += limit;
  } catch (error) {
    console.error("Fetch error:", error);
  } finally {
    loading = false;
  }
}
const idcheck=[];
// for appending the type of data
async function appendData(type,item){
  const div=document.getElementById("PostType")
  switch (type) {
    case "PostConfession":
      div.innerHTML+=`<div class="h-auto w-[95%] rounded-lg bg-[#262629] flex justify-center items-center flex-col">
        <!-- for upper headers and count -->
        <div class="py-1">
            <div class="flex justify-center items-center font-semibold text-lg my-2">Confession</div>
            <div class="flex w-auto items-center justify-center flex-row gap-6 my-2">
                <button class="likebutton" onclick="getcontainer('${item._id}','${type}')">
                    <svg xmlns="http://www.w3.org/2000/svg" height="14" width="10.5"
                        viewBox="0 0 384 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path fill="#ffffff"
                            d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
                    </svg>
                </button>
                <div id="${item._id}">${item.likes}</div>
                <button>
                    <svg xmlns="http://www.w3.org/2000/svg" height="14" width="10.5"
                        viewBox="0 0 384 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path fill="#ffffff"
                            d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
                    </svg>
                </button>
            </div>
        </div>
        <!-- for the main text area -->
        <div class="w-[99.5%] bg-black p-5">${item.message}
        </div>
        <!-- for the comment area -->
        <div class="px-7 h-12 w-full flex items-center justify-end text-sm flex-row gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" aria-hidden="true" data-slot="icon" class="h-5 w-5 mr-1">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z">
                </path>
            </svg>
            <div></div>
            <div>Comments(comming soon)</div>
        </div>
    </div>`;
      break;

    case "PostPoll":
      div.innerHTML+=`<div class="h-auto w-[95%] rounded-lg bg-[#262629] flex justify-center items-center flex-col">
        <!-- for upper headers and count -->
        <div class="py-1">
            <div class="flex justify-center items-center font-semibold text-lg my-2">Polls</div>
            <div class="flex w-auto items-center justify-center flex-row gap-6 my-2">
                <button class="likebutton" onclick="getcontainer('${item._id}','${type}')">
                    <svg xmlns="http://www.w3.org/2000/svg" height="14" width="10.5"
                        viewBox="0 0 384 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path fill="#ffffff"
                            d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
                    </svg>
                </button>
                <div id="${item._id}">${item.likes}</div>
                <button>
                    <svg xmlns="http://www.w3.org/2000/svg" height="14" width="10.5"
                        viewBox="0 0 384 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path fill="#ffffff"
                            d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
                    </svg>
                </button>
            </div>
        </div>
        <!-- for the main text area -->
        <div class="w-[99.5%] bg-black p-5 space-y-1">
            <div class="p-1">${item.question}</div>
            <div class="w-full flex flex-col items-start gap-2">
                <button class="option-button a${item._id} p-2 rounded-lg border-2 border-[#262629] w-full flex " onclick=getpollsbutton(this)>${item.option1}</button>
                <button class="option-button b${item._id} p-2 rounded-lg border-2 border-[#262629] w-full flex " onclick=getpollsbutton(this)>${item.option2}</button>
                <button class="option-button c${item._id} p-2 rounded-lg border-2 border-[#262629] w-full flex " onclick=getpollsbutton(this)>${item.option3}</button>
                <button class="option-button d${item._id} p-2 rounded-lg border-2 border-[#262629] w-full flex " onclick=getpollsbutton(this)>${item.option4}</button>
            </div>
        </div>
        <!-- for the comment area -->
        <div class="px-7 h-12 w-full flex items-center justify-end text-sm flex-row gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" aria-hidden="true" data-slot="icon" class="h-5 w-5 mr-1">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z">
                </path>
            </svg>
            <div></div>
            <div>Comments(comming soon)</div>
        </div>
    </div>`
      break;

    case "Postimage":
      div.innerHTML+=`<div class="h-auto w-[95%] rounded-lg bg-[#262629] flex justify-center items-center flex-col">
        <!--   for upper header count -->
        <div class="py-1">
            <div class="flex justify-center items-center font-semibold text-lg my-2">Meme</div>
            <div class="flex w-auto items-center justify-center flex-row gap-6 my-2">
                <button class="likebutton" onclick="getcontainer('${item._id}','${type}')">
                    <svg xmlns="http://www.w3.org/2000/svg" height="14" width="10.5"
                        viewBox="0 0 384 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path fill="#ffffff"
                            d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
                    </svg>
                </button>
                <div id="${item._id}">${item.likes}</div>
                <button>
                    <svg xmlns="http://www.w3.org/2000/svg" height="14" width="10.5"
                        viewBox="0 0 384 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path fill="#ffffff"
                            d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
                    </svg>
                </button>
            </div>
        </div>
        <!-- meme upload area -->
        <div class="bg-black py-3 w-full h-auto flex items-center justify-center flex-col gap-2">
            <img class="fill w-[50%] h-auto rounded-lg max-md:w-[100%]" src="${item.imageurl}"  alt="unable to load the image">
            <div>${item.caption}</div>
        </div>
        <!-- for the comment area -->
        <div class="px-7 h-12 w-full flex items-center justify-end text-sm flex-row gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" aria-hidden="true" data-slot="icon" class="h-5 w-5 mr-1">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z">
                </path>
            </svg>
            <div></div>
            <div>Comments(comming soon)</div>
        </div>
    </div>`
      break;
    default:
      console.log("default is working")
  }
}

window.addEventListener("scroll",() => {

  setTimeout(async()=>{
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !loading) 
      {
        await postrequest(lastClickedButton ? lastClickedButton.id : "All")
      }
  },500)
});

// for default click
document.getElementById("PostConfession").click();

async function getcontainer(id,type){ 
  try {
    if(!idcheck.includes(id)){
      idcheck.push(id);
      let likes=parseInt(document.getElementById(id).innerText)+1;
      document.getElementById(id).innerText=likes
      const response=await fetch("/updatelikes",{
        method:"POST",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
          id,type
        })
      })
      const data=await response.json()
      if(data.ok){
        console.log("yes its working")
      }
      else{
        console.log("data is not working")
      }
    }
  } catch (error) {
    console.log("Some error occured with updating likes")
  }
}

async function getpollsbutton(params) {
  // console.log(params.classList[1])
  const id=params.classList[1]
  // console.log(`type of option : ${id.slice(0,1)}`)
  // console.log(`id : ${id.slice(1)}`)

  const array=['a','b','c','d']
  array.forEach(a=>{
    if(document.querySelector(`.${a}${id.slice(1)}`).classList.contains("outline")){
    document.querySelector(`.${a}${id.slice(1)}`).classList.remove("outline")
    document.querySelector(`.${a}${id.slice(1)}`).classList.remove("outline-white")
    }
  })
  document.querySelector(`.${id}`).classList.add("outline")
  document.querySelector(`.${id}`).classList.add("outline-white")

}
// this function is to find the offset width and tell the number of users choice as percentage
let isFetching = false;

async function calculateEngagement(params) {
    try {
      if (isFetching) return;  // Prevent multiple simultaneous calls
      isFetching = true;
      const type=params.slice(0,1);
      const id=params.slice(1)
      const response = await fetch("/calculateEngagement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, id }),
      });

      const {data} = await response.json();
      console.log(data)
      const option1=data.option1choice
      const option2=data.option2choice
      const option3=data.option3choice
      const option4=data.option4choice
      // code for maths calculating
      calculatepercentage(option1,option2,option3,option4,id)
    } catch (error) {
        console.error("Error fetching engagement:", error);
    } finally {
        isFetching = false;
    }
}
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("option-button")) {
    const classid=event.target.classList[1];
    calculateEngagement(classid);
  }
});

function calculatepercentage(option1, option2, option3, option4, id) {
  const total = option1 + option2 + option3 + option4;
  const option1value = (option1 / total) * 100;
  const option2value = (option2 / total) * 100;
  const option3value = (option3 / total) * 100;
  const option4value = (option4 / total) * 100;
  const percentage = [option1value, option2value, option3value, option4value];

  const arr = ['a', 'b', 'c', 'd'];
  
  arr.forEach((item, index) => {
      const btn = document.querySelector(`.${item}${id}`);
      if (btn) {
          btn.classList.add("relative", "overflow-hidden");

          const width = btn.offsetWidth;
          const currentwidth = (width * percentage[index]) / 100;

          const temp_innertext = btn.innerHTML;

          btn.innerHTML = `
              <div class="absolute left-0 top-0 h-full bg-[#262629] rounded-sm" style="width: ${currentwidth}px;"></div>
              <div class="relative z-10 flex justify-start w-full">${temp_innertext} ${percentage[index].toFixed(1)}%</div>
          `;
      }
  });
}

// for reload after the post has been added
document.getElementById("postconfessionsubmitbutton").addEventListener("click",()=>{
  setTimeout(()=>{
    document.getElementById("All").click()},500
  )
})