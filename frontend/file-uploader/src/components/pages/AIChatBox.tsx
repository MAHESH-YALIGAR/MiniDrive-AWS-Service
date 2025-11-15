import React, { useState, useRef } from "react";
import { X, Send } from "lucide-react";

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

interface Dimensions {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface ResizeState {
  isResizing: boolean;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startX_pos: number;
  startY_pos: number;
  direction: string;
}

interface ApiResponse {
  reply: string;
  success?: boolean;
  error?: string;
}

const AIChatBox: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startX_pos: 0,
    startY_pos: 0,
    direction: "",
  });

  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 420,
    height: 550,
    x: window.innerWidth - 470,
    y: 50,
  });

  const chatBoxRef = useRef<HTMLDivElement>(null);

  const MIN_WIDTH = 320;
  const MIN_HEIGHT = 400;

  const clampPosition = (x: number, y: number, width: number, height: number) => {
    const padding = 10;
    const maxX = window.innerWidth - width - padding;
    const maxY = window.innerHeight - height - padding;

    return {
      x: Math.max(padding, Math.min(x, maxX)),
      y: Math.max(padding, Math.min(y, maxY)),
    };
  };

  const sendMessage = async (): Promise<void> => {
    if (!message.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/api/gemini/rag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();

      if (data.success === false || data.error) {
        throw new Error(data.error || "Failed to get response");
      }

      setChat((prevChat) => [
        ...prevChat,
        { role: "user", text: message },
        { role: "ai", text: data.reply || "No response received" },
      ]);

      setMessage("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("❌ AI Request Error:", errorMessage);
      setError(errorMessage);

      setChat((prevChat) => [
        ...prevChat,
        { role: "user", text: message },
        { role: "ai", text: `❌ Error: ${errorMessage}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - dimensions.x,
      y: e.clientY - dimensions.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;

      const clamped = clampPosition(newX, newY, dimensions.width, dimensions.height);
      setDimensions((prev) => ({
        ...prev,
        x: clamped.x,
        y: clamped.y,
      }));
    }

    if (resizeState.isResizing) {
      const deltaX = e.clientX - resizeState.startX;
      const deltaY = e.clientY - resizeState.startY;

      let newWidth = resizeState.startWidth;
      let newHeight = resizeState.startHeight;
      let newX = resizeState.startX_pos;
      let newY = resizeState.startY_pos;

      const dir = resizeState.direction;

      // Handle right resize
      if (dir.includes("right")) {
        newWidth = Math.max(MIN_WIDTH, resizeState.startWidth + deltaX);
      }

      // Handle left resize
      if (dir.includes("left")) {
        newWidth = Math.max(MIN_WIDTH, resizeState.startWidth - deltaX);
        if (newWidth > MIN_WIDTH) {
          newX = resizeState.startX_pos + deltaX;
        }
      }

      // Handle bottom resize
      if (dir.includes("bottom")) {
        newHeight = Math.max(MIN_HEIGHT, resizeState.startHeight + deltaY);
      }

      // Handle top resize
      if (dir.includes("top")) {
        newHeight = Math.max(MIN_HEIGHT, resizeState.startHeight - deltaY);
        if (newHeight > MIN_HEIGHT) {
          newY = resizeState.startY_pos + deltaY;
        }
      }

      // Clamp position to screen bounds
      const clamped = clampPosition(newX, newY, newWidth, newHeight);

      setDimensions({
        width: newWidth,
        height: newHeight,
        x: clamped.x,
        y: clamped.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setResizeState({ ...resizeState, isResizing: false });
  };

  React.useEffect(() => {
    if (isDragging || resizeState.isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, resizeState, dimensions, dragOffset]);

  const handleResizeMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    direction: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setResizeState({
      isResizing: true,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: dimensions.width,
      startHeight: dimensions.height,
      startX_pos: dimensions.x,
      startY_pos: dimensions.y,
      direction,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = (): void => {
    setChat([]);
    setError("");
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open AI Chat"
          className="fixed bottom-8 right-8 h-20 w-20 flex items-center justify-center
            bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 
            text-white text-3xl rounded-full shadow-xl animate-bounce 
            hover:scale-110 transform transition duration-300 z-40"
        >
          🤖
        </button>
      )}

      {/* Chat Box with Resize Handles */}
      {open && (
        <div
          ref={chatBoxRef}
          className="fixed z-50 bg-white shadow-2xl rounded-2xl border-2 border-gray-300 overflow-hidden flex flex-col group"
          style={{
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            left: `${dimensions.x}px`,
            top: `${dimensions.y}px`,
            userSelect: "none",
          }}
        >
          {/* Header - Draggable */}
          <div
            className="flex justify-between items-center 
              bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 
              text-white px-4 py-3 shadow-md cursor-move select-none hover:shadow-lg transition"
            onMouseDown={handleHeaderMouseDown}
          >
            <h2 className="font-bold text-lg flex items-center gap-2">
              📚 AI Study Assistant
            </h2>
            <div className="flex gap-2">
              <button
                onClick={clearChat}
                title="Clear chat"
                className="p-1 hover:bg-white/20 rounded transition cursor-pointer"
              >
                🗑️
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="p-1 hover:bg-red-400 rounded transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {chat.length === 0 && (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p className="text-center">👋 Start a conversation!</p>
              </div>
            )}
            {chat.map((c, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl shadow-sm max-w-[80%] text-sm leading-relaxed break-words ${
                  c.role === "user"
                    ? "ml-auto bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border border-indigo-300"
                    : "mr-auto bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300"
                }`}
              >
                <b className="block mb-1">{c.role === "user" ? "👤 You" : "🤖 AI"}:</b>
                <div className="whitespace-pre-wrap">{c.text}</div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="animate-spin">⏳</div>
                <p>AI is thinking...</p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="px-4 py-2 bg-red-100 border-t border-red-300 text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Input Box */}
          <div className="flex gap-2 border-t p-3 bg-white rounded-b-xl">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="💡 Ask me anything..."
              disabled={loading}
              className="flex-1 text-black border border-gray-300 px-4 py-2 rounded-lg text-sm 
                focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent
                disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !message.trim()}
              title="Send message (Enter)"
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 
                text-white p-2 rounded-lg shadow hover:scale-105 
                transform transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center"
            >
              {loading ? "⏳" : <Send size={18} />}
            </button>
          </div>

          {/* Resize Handles - Right */}
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, "right")}
            className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-500 transition-all opacity-0 group-hover:opacity-100 hover:w-2"
            title="Drag to resize width (Right)"
          />

          {/* Resize Handles - Bottom */}
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, "bottom")}
            className="absolute bottom-0 left-0 h-1.5 w-full cursor-row-resize hover:bg-blue-500 transition-all opacity-0 group-hover:opacity-100 hover:h-2"
            title="Drag to resize height (Bottom)"
          />

          {/* Resize Handles - Left */}
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, "left")}
            className="absolute top-0 left-0 w-1.5 h-full cursor-col-resize hover:bg-blue-500 transition-all opacity-0 group-hover:opacity-100 hover:w-2"
            title="Drag to resize width (Left)"
          />

          {/* Resize Handles - Top */}
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, "top")}
            className="absolute top-0 left-0 h-1.5 w-full cursor-row-resize hover:bg-blue-500 transition-all opacity-0 group-hover:opacity-100 hover:h-2"
            title="Drag to resize height (Top)"
          />

          {/* Corner - Bottom Right */}
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, "bottom-right")}
            className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize bg-gradient-to-tl from-blue-500 to-transparent opacity-0 group-hover:opacity-100 rounded-tl transition-all"
            title="Drag to resize both (Bottom-Right)"
          />

          {/* Corner - Bottom Left */}
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, "bottom-left")}
            className="absolute bottom-0 left-0 w-5 h-5 cursor-sw-resize bg-gradient-to-tr from-blue-500 to-transparent opacity-0 group-hover:opacity-100 rounded-tr transition-all"
            title="Drag to resize both (Bottom-Left)"
          />

          {/* Corner - Top Right */}
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, "top-right")}
            className="absolute top-0 right-0 w-5 h-5 cursor-ne-resize bg-gradient-to-bl from-blue-500 to-transparent opacity-0 group-hover:opacity-100 rounded-bl transition-all"
            title="Drag to resize both (Top-Right)"
          />

          {/* Corner - Top Left */}
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, "top-left")}
            className="absolute top-0 left-0 w-5 h-5 cursor-nw-resize bg-gradient-to-br from-blue-500 to-transparent opacity-0 group-hover:opacity-100 rounded-br transition-all"
            title="Drag to resize both (Top-Left)"
          />
        </div>
      )}
    </>
  );
};

export default AIChatBox;