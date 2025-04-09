export const FileUpload = ({ onFileSelect }) => (
  <input 
    type="file" 
    onChange={(e) => e.target.files?.[0]?.text().then(onFileSelect)}
    className="mb-4 text-white"
  />
);