
interface FilePreviewProps {
  file: File | null;
  previewUrl: string | null;
}

const FilePreview = ({ file, previewUrl }: FilePreviewProps) => {
  if (!file) return null;

  if (previewUrl) {
    return (
      <div className="mt-4 flex justify-center animate-fade-in">
        <img
          src={previewUrl}
          alt="Preview"
          className="max-w-xs max-h-48 object-contain rounded-lg border border-mutts-primary/20"
        />
      </div>
    );
  }

  return (
    <div className="mt-4 text-center text-sm text-gray-600 animate-fade-in">
      File selected: {file.name}
    </div>
  );
};

export default FilePreview;
