import { useState } from "react";
import "./PromptInput.css"; 

export function PromptInput(props: {
  onSubmit: (prompt: string) => void;
  loading?: boolean;
}) {
  const [prompt, setPrompt] = useState("");

  const handleSend = () => {
    if (prompt.trim()) {
      props.onSubmit(prompt);
      setPrompt(""); 
    }
  };

  return (
    <div className="prompt-container">
      <input 
        className="prompt-input-field"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder='.....Write a message'
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button
        className="prompt-send-button"
        onClick={handleSend}
        disabled={props.loading || !prompt.trim()}
      >
        {props.loading ? "..." : "Send"}
      </button>
    </div>
  );
}