const messagesDiv = document.getElementById('messages');
const nameInput = document.getElementById('name-input');
const messageInput = document.getElementById('message-input');
const fileInput = document.getElementById('file-input');
const sendBtn = document.getElementById('send-btn');

const socket = new WebSocket("ws://localhost:8000");

// Load name from localStorage if available
window.addEventListener('load', () => {
    const savedName = localStorage.getItem('chatUsername');
    if (savedName) {
        nameInput.value = savedName;
        nameInput.disabled = true;
    }
});

// Save username when entered
nameInput.addEventListener('change', () => {
    const name = nameInput.value.trim();
    if (name) {
        localStorage.setItem('chatUsername', name);
        nameInput.disabled = true;
    }
});

// Event listener for incoming messages
socket.addEventListener("message", (event) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = event.data;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Event listener for WebSocket connection errors
socket.addEventListener("error", () => {
    alert("WebSocket connection error. Please ensure the server is running.");
});

// Event listener for WebSocket closure
socket.addEventListener("close", () => {
    alert("WebSocket connection closed. Messages cannot be sent or received.");
});

// Function to send a message
function sendMessage(message) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(message);
    } else {
        alert("WebSocket is not connected. Please try again later.");
    }
}

// Handle pressing Enter and Ctrl+Enter
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.ctrlKey) {
        e.preventDefault();
        sendBtn.click();
    } else if (e.key === 'Enter' && e.ctrlKey) {
        const cursorPosition = messageInput.selectionStart;
        messageInput.value = 
            messageInput.value.substring(0, cursorPosition) + "\n" + messageInput.value.substring(cursorPosition);
        messageInput.selectionStart = messageInput.selectionEnd = cursorPosition + 1;
    }
});

// Event listener for send button click
sendBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    const file = fileInput.files[0];

    if (!name) {
        alert('Please enter your name.');
        return;
    }

    if (!message && !file) {
        alert('Please type a message or select a file.');
        return;
    }

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileMessage = `${name}: [File - ${file.name}]`;
            sendMessage(fileMessage);
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');

            if (file.type.startsWith('image')) {
                messageElement.innerHTML = `<strong>${name}:</strong><br><img src="${e.target.result}" alt="${file.name}">`;
            } else if (file.type.startsWith('video')) {
                messageElement.innerHTML = `<strong>${name}:</strong><br><video controls><source src="${e.target.result}" type="${file.type}">Your browser does not support the video tag.</video>`;
            } else {
                messageElement.innerHTML = `<strong>${name}:</strong><br><em>Attachment: ${file.name}</em>`;
            }

            messagesDiv.appendChild(messageElement);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        };
        reader.readAsDataURL(file);
    } else {
        sendMessage(`${name}: ${message}`);
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.textContent = `${name}: ${message}`;
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    messageInput.value = '';
    fileInput.value = '';
});

// Additional Features
// 1. Clear chat button
const clearChatButton = document.createElement('button');
clearChatButton.textContent = "Clear Chat";
clearChatButton.style.marginTop = "10px";
clearChatButton.addEventListener('click', () => {
    messagesDiv.innerHTML = '';
});

// 2. Change username button
const changeNameButton = document.createElement('button');
changeNameButton.textContent = "Change Name";
changeNameButton.style.marginLeft = "10px";
changeNameButton.addEventListener('click', () => {
    nameInput.disabled = false;
    nameInput.value = '';
    localStorage.removeItem('chatUsername');
});

const container = document.querySelector('.container');
container.appendChild(clearChatButton);
container.appendChild(changeNameButton);

// 3. Show file preview before sending
fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
        const previewElement = document.createElement('div');
        previewElement.classList.add('message');
        const reader = new FileReader();

        reader.onload = (e) => {
            if (file.type.startsWith('image')) {
                previewElement.innerHTML = `<strong>Preview:</strong><br><img src="${e.target.result}" alt="${file.name}">`;
            } else if (file.type.startsWith('video')) {
                previewElement.innerHTML = `<strong>Preview:</strong><br><video controls><source src="${e.target.result}" type="${file.type}">Your browser does not support the video tag.</video>`;
            } else {
                previewElement.innerHTML = `<strong>Preview:</strong><br><em>Attachment: ${file.name}</em>`;
            }
            messagesDiv.appendChild(previewElement);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        };
        reader.readAsDataURL(file);
    }
});

// 4. Notify user when WebSocket connects
socket.addEventListener("open", () => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.textContent = "Connected to the chat server.";
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// 5. Add timestamps to messages
function addTimestamp(messageElement) {
    const timestamp = new Date().toLocaleTimeString();
    const timestampElement = document.createElement('span');
    timestampElement.style.fontSize = '0.8em';
    timestampElement.style.color = '#888';
    timestampElement.style.marginLeft = '10px';
    timestampElement.textContent = timestamp;
    messageElement.appendChild(timestampElement);
}

messagesDiv.addEventListener('DOMNodeInserted', (event) => {
    const newMessage = event.target;
    if (newMessage.classList.contains('message') && !newMessage.querySelector('span')) {
        addTimestamp(newMessage);
    }
});
