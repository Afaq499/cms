import React, { useState } from "react";
import "./StudentChatbot.css";

export function StudentChatbot() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! I’m your AI Study Assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Replace with your actual Gemini API key
  const API_KEY = "YOUR_GEMINI_API_KEY";

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "AIzaSyDKmjNUAIU2xzbMiCNcoANpSCPuzB9z40w" + API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: input }] }],
          }),
        }
      );

      const data = await response.json();
      const botMessage =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn’t understand that.";

      setMessages((prev) => [...prev, { from: "bot", text: botMessage }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Error connecting to AI service. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <h3>AI Chatbot Assistant</h3>
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.from}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="chat-message bot">Thinking...</div>}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Ask me about your course, assignments, or lectures..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
