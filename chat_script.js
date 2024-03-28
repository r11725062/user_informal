const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable to store user's message
const API_KEY = ""; // Paste your API key here
const inputInitHeight = chatInput.scrollHeight;

let chatHistory = []; 
function addToChatHistory(sender, message) {
    chatHistory.push({sender: sender, message: message});
}

const createChatLi = (message, className) => {
    // Create a chat <li> element with passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    const avatarSrc = localStorage.getItem("avatarSrc") || "ava_images/ava_default.png";
    let chatContent = className === "outgoing" ? `<p></p>` : `<img class="ava_image" src="${avatarSrc}"><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi; // return chat <li> element
}

const generateResponse = (chatElement) => {
    const netlifyFunctionURL = "/.netlify/functions/api"; // Netlify 函数的路径
    const messageElement = chatElement.querySelector("p");

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ userMessage: userMessage })
    };

    fetch(netlifyFunctionURL, requestOptions).then(res => res.json()).then(data => {
        // 假设返回的数据包含在 'message' 字段
        messageElement.textContent = data.message;
        addToChatHistory("bot", messageElement.textContent); 
    }).catch(() => {
        messageElement.classList.add("error");
        messageElement.textContent = "哎呀！出錯了。請再試一次。";
    }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}

const handleChat = () => {
    userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
    if(!userMessage) return;

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    addToChatHistory("user", userMessage); 
    chatInput.style.height = `${inputInitHeight}px`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    
    setTimeout(() => {
        // Display "Thinking..." message while waiting for the response
        const incomingChatLi = createChatLi("正在輸入訊息...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}

chatInput.addEventListener("input", () => {
    // Adjust the height of the input textarea based on its content
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // If Enter key is pressed without Shift key and the window 
    // width is greater than 800px, handle the chat
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

document.addEventListener("DOMContentLoaded", () => { 
    // if the webpage opened, the chatroom show
    document.body.classList.add("show-chatbot");
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
//chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

function submitChatHistoryToGoogleForm() {
    // 将聊天历史转换为一个字符串
    let chatHistoryString = chatHistory.map(item => `${item.sender}: ${item.message}`).join('\n');
    // 伪代码示例，展示如何在 chat.html 中处理 localStorage 数据
    const avatarSrc = localStorage.getItem("avatarSrc") || "default.png";
    const userName = localStorage.getItem("userName") || "default_name";
    // 构造表单数据
    let formData = new FormData();
    formData.append("entry.938012830", 'user');
    formData.append("entry.25562195", "informal");
    formData.append("entry.22358687", userName);
    formData.append("entry.1553700084", avatarSrc);
    formData.append("entry.801005873", chatHistoryString);
     // 使用fetch替代$.ajax提交表单
    fetch("https://docs.google.com/forms/u/0/d/e/1FAIpQLSedu6Xgk9J57Z7p1NmCSabbymfZ5XfTVDj1Qobu6p5IFJv0mw/formResponse", {
        method: "POST",
        mode: "no-cors", // 注意：这将导致无法直接读取响应，但可以允许请求发送
        body: new URLSearchParams(formData)
    }).then(response => {
        console.log("Form submitted");
    }).catch(error => {
        console.error("Submission failed", error);
    });
}

function startTimer(duration, display) {
    let timer = duration, minutes, seconds;
    const interval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = "剩餘時間：" + minutes + "：" + seconds; // 在這裡添加“剩餘時間”

        if (--timer < 0) {
            clearInterval(interval);
            submitChatHistoryToGoogleForm()
            window.location.href = 'endpage.html'; // 替換為實際的跳轉URL
        }
    }, 1000);
}

window.onload = function () {
    const duration = 180, // 這裡設置倒數計時的總秒數
        display = document.querySelector('#timer');
    startTimer(duration, display);
    
    var avatarSrc = localStorage.getItem("avatarSrc");
    var userName = localStorage.getItem("userName");
  
    // 如果信息存在，則更新頁面上的頭像和姓名
    if (avatarSrc && userName) {
      document.querySelector(".ava_image").src = avatarSrc;
      // 假設你有一個顯示用戶名的元素
      document.getElementById("user-name-display").textContent = userName;
    }
};

document.querySelector('.material-symbols-outlined').addEventListener('click', function() {
    var popupBox = document.querySelector('.popup-box');
    if (popupBox.style.display === 'none') {
      popupBox.style.display = 'block';
    } else {
      popupBox.style.display = 'none';
    }
  });
  
