import React, { useEffect, useState, ChangeEvent } from "react";
import { Search, Send, X } from "lucide-react";

interface FileData {
  fileKey: string;
  fileName: string;
}

interface UserEmail {
  _id: string;
  email: string;
}

interface ShareFileModalProps {
  file: FileData;
  onClose: () => void;
}

const ShareFileModal: React.FC<ShareFileModalProps> = () => {
    const [emails, setEmails] = useState<UserEmail[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<UserEmail[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all emails from backend
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://localhost/api/share/getemail", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error fetching emails");

        const data: UserEmail[] = await res.json();
        setEmails(data);
        setFilteredEmails(data);
      } catch (error) {
        console.error("Error fetching emails:", error);
      }
    };
    fetchEmails();
  }, []);

  // 🔍 Handle search filter
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchTerm(query);
    const filtered = emails.filter((user) =>
      user.email.toLowerCase().includes(query)
    );
    setFilteredEmails(filtered);
  };

  // 🚀 Handle share action
  const handleShare = async () => {
    if (!selectedEmail) return alert("Please select an email to share with");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://localhost/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileKey: file.fileKey,
          fileName: file.fileName,
          sharedWith: selectedEmail,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ File shared successfully!\nLink: ${data.link}`);
        onClose();
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error("Error sharing file:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[420px] p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500 transition"
        >
          <X size={22} />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Share File: <span className="text-blue-600">{file.fileName}</span>
        </h2>

        {/* Search bar */}
        <div className="relative mb-3">
          <Search
            size={18}
            className="absolute left-3 top-2.5 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search email..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Email list */}
        <div className="max-h-48 overflow-y-auto border rounded-lg">
          {filteredEmails.length > 0 ? (
            filteredEmails.map((user) => (
              <div
                key={user._id}
                onClick={() => setSelectedEmail(user.email)}
                className={`p-2 cursor-pointer border-b hover:bg-blue-50 ${
                  selectedEmail === user.email ? "bg-blue-100" : ""
                }`}
              >
                <p className="text-gray-700 text-sm">{user.email}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">
              No matching users found
            </p>
          )}
        </div>

        {/* Selected Email */}
        {selectedEmail && (
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-700">
              Selected: <span className="font-medium">{selectedEmail}</span>
            </p>
          </div>
        )}

        {/* Share Button */}
        <button
          onClick={handleShare}
          disabled={loading}
          className="mt-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-xl font-semibold hover:scale-105 transition-transform shadow-md"
        >
          {loading ? (
            "Sharing..."
          ) : (
            <>
              <Send size={18} />
              Share File
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ShareFileModal;
