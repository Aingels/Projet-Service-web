let pseudo;

// Collapsible
var coll = document.getElementsByClassName("collapsible");
let currentPort = -1;
$( document ).ready(function() {
    firstBotMessage();
});

for (let i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
        this.classList.toggle("active");

        var content = this.nextElementSibling;

        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }

    });
}

function getTime() {
    let today = new Date();
    hours = today.getHours();
    minutes = today.getMinutes();

    if (hours < 10) {
        hours = "0" + hours;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    let time = hours + ":" + minutes;
    return time;
}

// Gets the first message
function firstBotMessage() {
    let firstMessage = "How's it going?"
    setTimeout(() => {
        let botHtml = '<p class="botText"><span>' + firstMessage + '</span></p>';
         $("#chatbox").append(botHtml);

        document.getElementById("chat-bar-bottom").scrollIntoView(true);

    }, 1000)
    let time = getTime();
    
    $("#time").append(time);
    document.getElementById("userInput").scrollIntoView(false);
}



// Retrieves the response
function getHardResponse(userText) {
    let botResponse = getBotResponse(userText);
    let botHtml = '<p class="botText"><span>' + botResponse + '</span></p>';
    $("#chatbox").append(botHtml);

    document.getElementById("chat-bar-bottom").scrollIntoView(true);
}


async function chooseBot(port){
    console.log("Connected to bot which port is : ",port);
    currentPort = port;
    if (port!=-1){
        $("#connectionMessage").css('color','green');
        $("#connectionMessage").text("Connection done !");
    }
    
}



//Gets the text text from the input box and processes it
async function getResponse() {
    let message = $("#textInput").val();
    //todo definie username et vars en fonction de l'utilisateur
    
    let userSessionInfos = await fetch('http://localhost:3000/usersession').catch(err => console.log(err));
    const jsonuser = await userSessionInfos.json();
    const username = jsonuser.username;
    let favcolor = jsonuser.favcolor;

    console.log(username);
    

    let corp = {       
        username       
    }

    let param = {
        method : 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        body : JSON.stringify(corp)
    }

    const getColor = await fetch('http://localhost:3000/getFavoriteColor',param).catch(err => console.log(err));
    let vars = {"favcolor":favcolor}; //fetch

    corp = {
        message ,
        username ,
        vars
    }
    


    param = {
        method : 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        body : JSON.stringify(corp)
    }

    const response = await fetch('http://localhost:'+currentPort+'/reply', param);
    const json = await response.json();
    botResponse = json.reply;

    userText= document.getElementById('textInput').value;
    
    let userHtml = '<p class="userText"><span>' + userText + '</span></p>';

    $("#textInput").val("");
    $("#chatbox").append(userHtml);
    document.getElementById("chat-bar-bottom").scrollIntoView(true);

    setTimeout(() => {
        let botHtml = '<p class="botText"><span>' + botResponse + '</span></p>';
         $("#chatbox").append(botHtml);

        document.getElementById("chat-bar-bottom").scrollIntoView(true);

    }, 1000)

    

}

// Handles sending text via button clicks
function buttonSendText(sampleText) {
    let userHtml = '<p class="userText"><span>' + sampleText + '</span></p>';

    $("#textInput").val("");
    $("#chatbox").append(userHtml);
    document.getElementById("chat-bar-bottom").scrollIntoView(true);

    //Uncomment this if you want the bot to respond to this buttonSendText event
    // setTimeout(() => {
    //     getHardResponse(sampleText);
    // }, 1000)
}

function sendButton() {
    if (currentPort!=-1){
        getResponse();
    } else {
        $("#connectionMessage").css('color','red');
        $("#connectionMessage").text("You need to choose a bot first !");
    }
    
}

function heartButton() {
    buttonSendText("Heart clicked!")
}

// Press enter to send a message
$("#textInput").keypress(function (e) {
    if (e.which == 13) {
        sendButton();
    }
});

function setPseudo(pseudoGiven){
    pseudo=pseudoGiven;
}

function onLoadChatEjs(botPort,pseudoGiven){
    chooseBot(botPort);
    setPseudo(pseudoGiven);
}