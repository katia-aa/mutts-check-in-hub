
import { FileX } from "lucide-react";

interface FileListProps {
  files: File[];
  uploadingFileIndex: number | null;
  onRemoveFile?: (index: number) => void;
}

const FileList = ({ files, uploadingFileIndex, onRemoveFile }: FileListProps) => {
  if (files.length === 0) return null;
  
  return (
    <div className="mt-4 space-y-2">
      <h3 className="font-medium text-sm text-gray-700">Selected Files ({files.length}):</h3>
      {files.map((file, index) => (
        <div 
          key={`${file.name}-${index}`} 
          className={`flex items-center justify-between p-2 rounded-md ${
            uploadingFileIndex === index ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'
          }`}
        >
          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
            {onRemoveFile && uploadingFileIndex !== index && (
              <button 
                type="button" 
                onClick={() => onRemoveFile(index)} 
                className="text-red-500 hover:text-red-700"
                aria-label="Remove file"
              >
                <FileX size={16} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileList;
