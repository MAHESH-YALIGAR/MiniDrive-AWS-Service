import React, { useState } from "react";
import axios from "axios";

interface ShareFileModalProps {
  fileId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ShareFileModal: React.FC<ShareFileModalProps> = ({ fileId, isOpen, onClose }) => {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [permission, setPermission] = useState<"view" | "edit">("view");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleShare = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:5000/api/files/share",
        { fileId, recipientEmail, permission },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ File shared successfully!");
      setRecipientEmail("");
      setPermission("view");
    } catch (err: any) {
      console.error("Failed to share file:", err.response?.data || err.message);
      setMessage("❌ Failed to share file");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 font-bold"
        >
          X
        </button>
        <h2 className="text-xl font-semibold mb-4">Share File</h2>

        <label className="block mb-2 text-gray-700">Recipient Email</label>
        <input
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="user@example.com"
        />

        <label className="block mb-2 text-gray-700">Permission</label>
        <select
          value={permission}
          onChange={(e) => setPermission(e.target.value as "view" | "edit")}
          className="w-full px-3 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="view">View</option>
          <option value="edit">Edit</option>
        </select>

        <button
          onClick={handleShare}
          disabled={loading || !recipientEmail}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {loading ? "Sharing..." : "Share"}
        </button>

        {message && <p className="mt-3 text-center text-sm">{message}</p>}
      </div>
    </div>
  );
};

export default ShareFileModal;
