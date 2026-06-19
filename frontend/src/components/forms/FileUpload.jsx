import React, { useRef, useState } from 'react';
import { UploadCloud, X, FileText } from 'lucide-react';

const FileUpload = ({ label, name, onChange, accept, multiple = false, helperText }) => {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);

  const handleFiles = (fileList) => {
    const arr = Array.from(fileList);
    setFiles(multiple ? [...files, ...arr] : arr);
    onChange?.(multiple ? [...files, ...arr] : arr[0]);
  };

  const removeFile = (idx) => {
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);
    onChange?.(multiple ? next : null);
  };

  return (
    <div>
      {label && <label className="label-base">{label}</label>}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-8 text-center transition-colors hover:border-primary-400"
      >
        <UploadCloud className="h-8 w-8 text-gray-400" />
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <span className="font-medium text-primary-600">Click to upload</span> or drag and drop
        </p>
        {helperText && <p className="text-xs text-gray-400">{helperText}</p>}
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2 truncate text-gray-700 dark:text-gray-300">
                <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                {file.name}
              </span>
              <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-danger-500">
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileUpload;
