import React, { useState } from "react";
import ShareFileModal from "../pages/ShareFileModalProps ";

interface FileCardProps {
  file: any; // Replace with your file type
}

const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center">
      <p className="font-medium">{file.name}</p>
      <p className="text-gray-500 text-sm">{(file.size / 1024).toFixed(2)} KB</p>

      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
      >
        Share
      </button>

      <ShareFileModal
        fileId={file.key} // or file.id depending on your DB
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default FileCard;
