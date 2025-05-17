const API_KEY = ""
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const chatContainer = document.querySelector('.chats-container');
const promptForm = document.querySelector('.prompt-form');
const promptInput = document.querySelector('.prompt-input');

const themeToggle = document.querySelector('#theme-toggle-btn');

const chatHistory = [];
const userData = {
    message: "",
    file: {}
};
const typingEffect = (text, textElement, botMessagesDiv) => {
    textElement.textContent = ""; // Clear the text element before typing effect
    const words = text.split(" ");
    let wordsIndex = 0;

    const typingInterval = setInterval(() => {
        if (wordsIndex < words.length) {
            textElement.textContent += (wordsIndex === 0 ? "" : " ") + words[wordsIndex++];
            botMessagesDiv.classList.remove('loading'); // Remove loading class when typing starts
        } else {
            clearInterval(typingInterval);

        }

    }, 40); // Adjust the typing speed by changing the interval time (in milliseconds)
}

const botResponseGemini = async (botMessagesDiv) => {
    const textElement = botMessagesDiv.querySelector('.message-text');
    // CHAT HISTORY
    chatHistory.push({
        role: 'user',
        parts: [{ text: userMessages }]
    });

    // Try to fetch the bot response from the Gemini API
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contents: chatHistory })
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.error.message);

        console.log('Bot response:', data);
        // Format the response text markdown

        // Display the bot response
        const responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, "$1").trim();
        typingEffect(responseText, textElement, botMessagesDiv);
    } catch (error) {
        console.error('Error fetching bot response:', error);
    }
}


let userMessages = "";
const createMessagesDiv = (content, ...classes) => {
    const div = document.createElement('div');
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

const handleFormSendMessage = (e) => {
    e.preventDefault();
    const userMessages = promptInput.value.trim();
    if (!userMessages || document.body.classList.contains("bot-responding")) return;

    // Clear the input field
    promptInput.value = "";
    // userData.message = userMessages; // Store the user message in userData
    // document.body.classList.add('bot-responding', 'chats-active'); // Add light theme when bot is responding
    const userMesagesHtml = `<p class="message-text">${userMessages}</p>`
    const userMessagesDiv = createMessagesDiv(userMesagesHtml, 'user-message');
    chatContainer.appendChild(userMessagesDiv);
    // Simulate a bot response after a delay
    setTimeout(() => {
        const botMesagesHtml = `<img src="logo.svg" class="avatar"><p class="message-text">Thinking ....</p>`;
        const botMessagesDiv = createMessagesDiv(botMesagesHtml, 'bot-message', 'loading');
        chatContainer.appendChild(botMessagesDiv);
        botResponseGemini(botMessagesDiv);

    }, 600); // Simulate a delay for the bot response


}

// THEME TOGGLE DARK/LIGHT MODE
themeToggle.addEventListener('click', () => {
    const isLightTheme = document.body.classList.toggle('light-theme');
    localStorage.setItem('themeColor', isLightTheme ? 'light_mode' : 'dark_mode');
    themeToggle.textContent = isLightTheme ? 'dark_mode' : 'light_mode';
});
const isLightTheme = localStorage.getItem('themeColor') === 'light_mode';
document.body.classList.toggle('light-theme', isLightTheme);
themeToggle.textContent = isLightTheme ? 'dark_mode' : 'light_mode';

// CLEAR INPUT
document.querySelector('#delete-chats-btn').addEventListener('click', () => {
    chatHistory.length = 0; // Clear chat history
    chatContainer.innerHTML = "";
    document.body.classList.remove('bot-responding'); // Remove light theme if it was applied
})

// HANDLE SUGGESTIONS
document.querySelectorAll('.suggestion-items').forEach(item => {
    item.addEventListener('click', () => {
        promptInput.value = item.querySelector(".text").textContent;
        // Trigger form submission
        promptForm.dispatchEvent(new Event('submit'));
    });
});
promptForm.addEventListener('submit', handleFormSendMessage);