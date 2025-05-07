
interface FileListProps {
  files: File[];
  uploadingFileIndex: number | null;
}

const FileList = ({ files, uploadingFileIndex }: FileListProps) => {
  if (files.length === 0) return null;
  
  return (
    <div className="mt-4 space-y-2">
      <h3 className="font-medium text-sm text-gray-700">Selected Files:</h3>
      {files.map((file, index) => (
        <div 
          key={`${file.name}-${index}`} 
          className={`flex items-center justify-between p-2 rounded-md ${
            uploadingFileIndex === index ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'
          }`}
        >
          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
          <span className="text-xs text-gray-500">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </span>
        </div>
      ))}
    </div>
  );
};

export default FileList;
