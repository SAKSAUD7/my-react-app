import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function FileUpload({ onFileSelect, accept, multiple = false, maxFiles = 1 }) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    setError('');
    
    if (acceptedFiles.length === 0) {
      setError('No valid files selected');
      return;
    }

    if (acceptedFiles.length > maxFiles) {
      setError(`You can only upload ${maxFiles} file${maxFiles > 1 ? 's' : ''}`);
      return;
    }

    setFiles(acceptedFiles);
    onFileSelect(acceptedFiles);
  }, [maxFiles, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxFiles,
  });

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFileSelect(newFiles);
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 ${
          isDragActive ? 'border-primary-500 bg-primary-50' : ''
        }`}
      >
        <div className="text-center">
          <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
          <div className="mt-4 flex text-sm leading-6 text-gray-600">
            <input {...getInputProps()} />
            <span className="relative cursor-pointer rounded-md bg-white font-semibold text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2 hover:text-primary-500">
              Upload a file
            </span>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs leading-5 text-gray-600">
            {accept ? `Accepted file types: ${Object.keys(accept).join(', ')}` : 'All file types accepted'}
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {files.length > 0 && (
        <ul className="mt-4 divide-y divide-gray-100 rounded-md border border-gray-200">
          {files.map((file, index) => (
            <li
              key={index}
              className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6"
            >
              <div className="flex w-0 flex-1 items-center">
                <div className="ml-4 flex min-w-0 flex-1 gap-2">
                  <span className="truncate font-medium">{file.name}</span>
                  <span className="flex-shrink-0 text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="font-medium text-red-600 hover:text-red-500"
                >
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Remove file</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 