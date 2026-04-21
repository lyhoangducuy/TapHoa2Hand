import { useState } from "react";
import { chatWithAI } from "../../services/chatBoxService";

export default function ChatBox() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim() && !file) return;

        const userMsg = {
            role: "user",
            content: input,
            file: file ? URL.createObjectURL(file) : null
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setFile(null);
        setLoading(true);

        try {
            const res = await chatWithAI(input, file);

            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: res.result // ApiResponse
                }
            ]);
        } catch (err) {
            setMessages(prev => [
                ...prev,
                { role: "assistant", content: "Lỗi AI rồi 😢" }
            ]);
        }

        setLoading(false);
    };

    return (
        <>
            {/* Bubble */}
            <div
                onClick={() => setOpen(!open)}
                style={{
                    position: "fixed",
                    bottom: 20,
                    right: 20,
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "#6366f1",
                    color: "#fff",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    zIndex: 9999
                }}
            >
                🤖
            </div>

            {/* Chat Window */}
            {open && (
                <div
                    style={{
                        position: "fixed",
                        bottom: 90,
                        right: 20,
                        width: 320,
                        height: 450,
                        background: "#fff",
                        borderRadius: 12,
                        boxShadow: "0 0 15px rgba(0,0,0,0.2)",
                        display: "flex",
                        flexDirection: "column",
                        zIndex: 9999
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: 10,
                        borderBottom: "1px solid #eee",
                        fontWeight: "bold"
                    }}>
                        AI Assistant 🤖
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: 10
                    }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{
                                textAlign: m.role === "user" ? "right" : "left"
                            }}>
                                <div style={{
                                    display: "inline-block",
                                    padding: 8,
                                    borderRadius: 10,
                                    background: m.role === "user" ? "#6366f1" : "#eee",
                                    color: m.role === "user" ? "#fff" : "#000",
                                    margin: 5,
                                    maxWidth: "80%"
                                }}>
                                    {m.content}
                                    {m.file && (
                                        <img
                                            src={m.file}
                                            alt=""
                                            style={{ width: "100%", marginTop: 5 }}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && <div>AI đang trả lời...</div>}
                    </div>

                    {/* Input */}
                    <div style={{ padding: 10 }}>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            style={{ width: "100%", marginBottom: 5 }}
                        />

                        <input
                            type="file"
                            onChange={e => setFile(e.target.files[0])}
                        />

                        <button onClick={handleSend} style={{ width: "100%", marginTop: 5 }}>
                            Gửi
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}