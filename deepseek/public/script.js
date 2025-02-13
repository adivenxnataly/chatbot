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
        }, 500);
    });

    app.querySelector(".chat-screen #exit-chat").addEventListener("click", function () {
        const confirmExit = confirm("Apakah Anda yakin ingin keluar?");
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
            }, 500);
        }
    });

    app.querySelector(".chat-screen #send-message").addEventListener("click", function () {
        let message = app.querySelector(".chat-screen #message-input").value;
        if (message.length == 0) {
            return;
        }

        renderMessage("me", {
            username: uname,
            text: message,
        });

        socket.emit("prompt", {
            username: uname,
            text: message,
        });

        app.querySelector(".chat-screen #message-input").value = "";
    });

    socket.on("chatbot", function (message) {
        renderMessage("bot", message);
    });
    
    function formatAlignBlock(text) {
    // Regex untuk menangkap teks di antara \begin{align*} dan \end{align*}
    const regex = /\\begin\{align\*\}([\s\S]*?)\\end\{align\*\}/g;

    // Ganti setiap kemunculan align* dengan elemen yang diformat
    return text.replace(regex, (match, content) => {
        // Pisahkan setiap baris di dalam align*
        const lines = content.split('\\\\').map(line => line.trim());

        // Format setiap baris sebagai elemen <div> terpisah
        const formattedLines = lines.map(line => {
            // Hapus "&" dari baris
            line = line.replace(/&/g, '');
            return `<div class="math-line">${line}</div>`;
        }).join('');

        // Gabungkan semua baris ke dalam container
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
        processedText = processedText.replace(/\n+/g, '\n');
        processedText = processedText.replace(/\\\(([\s\S]*?)\\\),/g, '\\\($1\\\)');
        processedText = processedText.replace(/\\\[\n([\s\S]*?)\\\]\n/g, '\\\[$1\\\]');
        processedText = processedText.replace(/\\boxed\{(.*?)\}/g, '<div class="math-result">$1</div>');
        processedText = processedText.replace(/\\\(([\s\S]*?)\\\)/g, '<em>$1</em>');
        processedText = processedText.replace(/\\\[([\s\S]*?)\\\]/g, '<div class="math-box">$1</div>');
        processedText = processedText.replace(/\\times/g, '×');
        processedText = processedText.replace(/\\div/g, '÷');
        processedText = processedText.replace(/\\cdot/g, '•');

        // Format \quad sebagai spasi
        processedText = processedText.replace(/\\quad/g, '&emsp;');

        // Format \text{} sebagai teks biasa
        processedText = processedText.replace(/\\text\{(.*?)\}/g, '<span class="math-text">$1</span>');

        // Format langkah-langkah perhitungan (diawali dengan angka)
        processedText = processedText.replace(/(\d+\.)\s*(\d+\.)\s*(.*)/g, (match, outerNumber, innerNumber, content) => {
            return `<li>${outerNumber} ${content.trim()}</li>`;
        });
        processedText = processedText.replace(/(<li>.*<\/li>)/g, '<ol>$1</ol>');

        // Format hasil akhir
        processedText = processedText.replace(/Jadi, hasil dari (.*?) adalah:\s*\\\[(.*?)\\\]/g, '<div class="math-result">Hasil: $2</div>');

        // Tambahkan pemformatan umum lainnya
        processedText = processedText
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/###\s*(.*?)\n/g, "<h3>$1</h3>")
            .replace(/---/g, "<hr>")
            .replace(/\n```/g, "```")
            .replace(/```\n\n/g, "```")
            .replace(/^- (.*)/g, "• $1")
            .replace(/(.*) - (.*)/g, "$1 - $2")
            .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
                if (lang) {
                    return `<pre><code class="language-${lang}">${code}</code></pre>`;
                } else {
                    return `<pre><code>${code}</code></pre>`;
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