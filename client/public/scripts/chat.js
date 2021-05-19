// Collapsible
var coll = document.getElementsByClassName("collapsible");

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

//Gets the text text from the input box and processes it
async function getResponse() {
    let message = $("#textInput").val();
    let username = "men";
    let vars = undefined;
    let corp = {
        message ,
        username ,
        vars
    }
    


    let param = {
        method : 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        body : JSON.stringify(corp)
    }

    const response = await fetch('http://localhost:3000/reply', param);
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
    getResponse();
}

function heartButton() {
    buttonSendText("Heart clicked!")
}

// Press enter to send a message
$("#textInput").keypress(function (e) {
    if (e.which == 13) {
        getResponse();
    }
});