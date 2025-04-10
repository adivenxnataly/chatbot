(function () {
    const app = document.querySelector(".app");
    const socket = io();
    let uname;

    app.querySelector(".join-screen #join-user").addEventListener("click", function () {
        let username = app.querySelector(".join-screen #username").value;
        if (username.length == 0) {
            return;
        }
        uname = username;

        const joinScreen = app.querySelector(".join-screen");
        joinScreen.style.opacity = "0";
        joinScreen.style.visibility = "hidden";

        const transitionOverlay = document.createElement("div");
        transitionOverlay.classList.add("transition-overlay");
        app.appendChild(transitionOverlay);

        setTimeout(() => {
            transitionOverlay.classList.add("active");
        }, 10);

        setTimeout(() => {
            const chatScreen = app.querySelector(".chat-screen");
            chatScreen.classList.add("active");
            chatScreen.style.opacity = "1";
            chatScreen.style.visibility = "visible";

            transitionOverlay.classList.remove("active");

            setTimeout(() => {
                transitionOverlay.remove();
            }, 500);

            startTitleAnimation();
            startApiAnimation();
            startStatusLogoAnimation();
        }, 500);
    });

    function startAnimations() {
        const joinTitle = document.querySelector(".join-title");
        const chatbotTitle = document.querySelector(".chatbot-title");

        if (joinTitle) {
            joinTitle.classList.add("animate-left");
        }

        if (chatbotTitle) {
            setTimeout(() => {
                chatbotTitle.classList.add("animate-top");
            }, 1000);
        }
    }

    startAnimations();

    function startTitleAnimation() {
        const titleElement = document.querySelector(".innerchatbot-title");
        if (titleElement) {
            titleElement.classList.add("animate-down-in");
        }
    }

    function showApi() {
        const apiElement = document.querySelector(".api");
        if (apiElement) {
            apiElement.classList.remove("hidden");
            apiElement.classList.remove("animate-up-out");
            apiElement.classList.add("animate-down-in");
        }
    }

    function hideApi() {
        const apiElement = document.querySelector(".api");
        if (apiElement) {
            apiElement.classList.remove("animate-down-in");
            apiElement.classList.add("animate-up-out");

            setTimeout(() => {
                apiElement.classList.add("hidden");
            }, 1000);
        }
    }

    function startApiAnimation() {
        setTimeout(showApi, 1500);

        setTimeout(hideApi, 4000);
    }

    function startStatusLogoAnimation() {
        const statusLogo = document.querySelector(".status-logo");
        if (statusLogo) {
            statusLogo.classList.remove("show", "active", "error");
            statusLogo.style.opacity = "0";
            setTimeout(() => {
                statusLogo.classList.add("show");
            }, 4500);
        }
    }

    app.querySelector(".chat-screen #exit-chat").addEventListener("click", function () {
        const confirmExit = confirm("do you sure want to exit?");
        if (confirmExit) {
            const chatScreen = app.querySelector(".chat-screen");
            chatScreen.style.opacity = "0";
            chatScreen.style.visibility = "hidden";

            const transitionOverlay = document.createElement("div");
            transitionOverlay.classList.add("transition-overlay");
            app.appendChild(transitionOverlay);

            setTimeout(() => {
                transitionOverlay.classList.add("active");
            }, 10);

            setTimeout(() => {
                const joinScreen = app.querySelector(".join-screen");
                joinScreen.classList.add("active");
                joinScreen.style.opacity = "1";
                joinScreen.style.visibility = "visible";

                transitionOverlay.classList.remove("active");

                setTimeout(() => {
                    transitionOverlay.remove();
                }, 500);
                const statusLogo = document.querySelector(".status-logo");
                if (statusLogo) {
                    statusLogo.classList.remove("show", "active", "error");
                    statusLogo.style.opacity = "0";
                }
            }, 500);
        }
    });

    let loadingMessage = null;

    function showLoadingAnimation() {
        let messageContainer = app.querySelector(".chat-screen .messages");
        loadingMessage = document.createElement("div");
        loadingMessage.setAttribute("class", "message other-message");
        loadingMessage.innerHTML = `
        <img src="chatbot.jpg" alt="Chatbot Avatar" class="message-avatar">
        <div class="loading-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        </div>
        `;
        messageContainer.appendChild(loadingMessage);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    function hideLoadingAnimation() {
        if (loadingMessage) {
            loadingMessage.remove();
            loadingMessage = null;
        }
    }

    app.querySelector(".chat-screen #send-message").addEventListener("click", function () {
        let message = app.querySelector(".chat-screen #message-input").value;
        if (message.length == 0) {
            return;
        }

        const statusLogo = document.querySelector(".status-logo");
        if (statusLogo) {
            statusLogo.classList.remove("active", "error");
            statusLogo.classList.add("active");
        }

        this.classList.remove("active");
        this.classList.add("inactive");

        renderMessage("me", {
            username: uname,
            text: message,
        });

        showLoadingAnimation();

        socket.emit("prompt", {
            username: uname,
            text: message,
        });

        app.querySelector(".chat-screen #message-input").value = "";
    });

    socket.on("chatbot", function (message) {
        hideLoadingAnimation();
        renderMessage("bot", message);

        const sendButton = app.querySelector(".chat-screen #send-message");
        sendButton.classList.remove("inactive");
        sendButton.classList.add("active");

        const statusLogo = document.querySelector(".status-logo");
        if (statusLogo) {
            statusLogo.classList.remove("active", "error");

            if (message.type === "error") {
                statusLogo.classList.add("error");
            }
        }
    });

    function formatAlignBlock(text) {
        const regex = /\\begin\{align\*\}([\s\S]*?)\\end\{align\*\}/g;
        return text.replace(regex, (match, content) => {
            const lines = content.split('\\\\').map(line => line.trim());

            const formattedLines = lines.map(line => {
                line = line.replace(/&/g, '');
                return `<div class="math-line">${line}</div>`;
            }).join('');

            return `<div class="math-align">${formattedLines}</div>`;
        });
    }

    function renderMessage(type, message) {
        let messageContainer = app.querySelector(".chat-screen .messages");
        if (type == "me") {
            let el = document.createElement("div");
            el.setAttribute("class", "message my-message");
            el.innerHTML = `
            <div class="text">${message.text}</div>
            `;
            messageContainer.appendChild(el);
        } else if (type == "bot") {
            let el = document.createElement("div");
            el.setAttribute("class", "message other-message");

            let processedText = message.text;
            processedText = formatAlignBlock(processedText);
            processedText = processedText
                .replace(/\n([\s\S])\\\[\n/g, '\\\[\n')
                .replace(/\\\(([\s\S]*?)\\\),/g, '\\\($1\\\)')
                .replace(/\\\[\n([\s\S]*?)\\\]\n/g, '\\\[$1\\\]')
                .replace(/\\\[\n([\s\S]*?)\\boxed{/g, '\\\[\\boxed{')
                .replace(/\\boxed\{(.*?)\}/g, '<span class="math-result">$1</span>')
                .replace(/\\\(([\s\S]*?)\\\)/g, '<em>$1</em>')
                .replace(/\\\[([\s\S]*?)\\\]/g, '<span class="math-box">$1</span>')
                .replace(/\\times/g, '×')
                .replace(/\\div/g, '÷')
                .replace(/\\cdot/g, '•')
                .replace(/\\quad/g, '&emsp;')
                .replace(/\\text\{(.*?)\}/g, '<span class="math-text">$1</span>')
                .replace(/(\d+\.)\s*(\d+\.)\s*(.*)/g, (match, outerNumber, innerNumber, content) => {
                    return `<li>${outerNumber} ${content.trim()}</li>`;
                })
                .replace(/(<li>.*<\/li>)/g, '<ol>$1</ol>')
                .replace(/Jadi, hasil dari (.*?) adalah:\s*\\\[(.*?)\\\]/g, '<span class="math-result">Hasil: $2</span>')
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/###\s*(.*?)\n/g, "<h3>$1</h3>")
                .replace(/---/g, "<hr>")
                .replace(/\n```/g, "```")
                .replace(/```\n\n/g, "```")
                .replace(/(.*) - (.*)/g, "$1 - $2")
                .replace(/^\s*- (.*)/gm, "• $1")
                .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
                    if (lang) {
                        return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
                    } else {
                        return `<pre><code>${code.trim()}</code></pre>`;
                    }
                })
                .replace(/`([^`]+)`/g, "<code class='inline-code'>$1</code>")
                .replace(/_(.+?)_/g, "<em>$1</em>");
            processedText = `<p>${processedText}</p>`;

            if (message.type === "general") {
                el.innerHTML = `
                <img src="chatbot.jpg" alt="Chatbot Avatar" class="message-avatar">
                <div class="text">${processedText}</div>
                `;
            } else if (message.type === "error") {
                el.innerHTML = `
                <img src="chatbot.jpg" alt="Chatbot Avatar" class="message-avatar">
                <div class="text error">${processedText}</div>
                `;
            }

            messageContainer.appendChild(el);
            Prism.highlightAll();
        }

        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
})();