import React, { useState, useEffect, useRef } from "react";
import "./StudentChatbot.css";
import { Sidebar } from "./Sidbar";
import { API_URL } from "./constants";

export function StudentChatbot() {
  const [messages, setMessages] = useState([
    { 
      from: "bot", 
      text: "Hello! I'm your AI Study Assistant for the CMS (Course Management System). I can help you with information about your courses, assignments, quizzes, progress, and other student-related queries. How can I assist you today?" 
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // No need to fetch student data here - backend will handle it
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const newMessage = { from: "user", text: userMessage };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      // Get current student from localStorage
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (!currentUser || !currentUser._id) {
        throw new Error("User not found. Please login again.");
      }

      // Call backend chatbot API
      const response = await fetch(`${API_URL}/chatbot/message`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: currentUser._id,
          message: userMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = data.message || "Sorry, I couldn't understand that. Please try rephrasing your question.";

      setMessages((prev) => [...prev, { from: "bot", text: botMessage }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { 
          from: "bot", 
          text: `❌ Error: ${error.message || "Failed to get response. Please try again later."}` 
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="studentLayout">
        <div className="studentmain chatbot-main">
          <h1>AI Chatbot Assistant</h1>
          
          <div className="chatbot-container-full">
            <div className="chat-window-full">
              {messages.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.from}`}>
                  <div className="message-content">{msg.text}</div>
                </div>
              ))}
              {loading && (
                <div className="chat-message bot">
                  <div className="message-content">Thinking...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-full">
              <input
                type="text"
                placeholder="Ask me about your courses, assignments, quizzes, progress, or any CMS-related question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                disabled={loading}
              />
              <button 
                onClick={handleSend} 
                disabled={loading || !input.trim()}
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Sidebar />
    </>
  );
}
