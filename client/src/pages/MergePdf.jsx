import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { ArrowLeftIcon, DocumentDuplicateIcon, DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { uploadMultipleFiles } from '../utils/api';
import { downloadBlob } from '../utils/fileUtils';
import toast from 'react-hot-toast';

export default function MergePdf() {
  const [files, setFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileSelect = (acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setError(null);
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearFiles = () => {
    setFiles([]);
    setError(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files to merge');
      return;
    }

    setIsMerging(true);
    setError(null);
    const loadingToast = toast.loading('Merging your PDF files...');

    try {
      const response = await uploadMultipleFiles('/api/pdf/merge', files);
      downloadBlob(response, 'merged.pdf');
      toast.success('PDFs merged successfully!', { id: loadingToast });
      setFiles([]);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      const errorMessage = error.message || 'Failed to merge PDFs. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsMerging(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileSelect,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024 // 10MB per file
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
        <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </button>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Merge PDF Files
          </h1>
            <p className="mt-2 text-lg text-gray-600">
            Combine multiple PDF files into a single document while maintaining the original quality.
          </p>
        </div>

          {/* Upload Area */}
          <div className="mt-8">
          <div
            {...getRootProps()}
              className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-500 hover:bg-gray-50'
              }`}
          >
              <input {...getInputProps()} />
              <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-base font-semibold text-gray-900">
                  {isDragActive ? 'Drop your PDFs here' : 'Drag and drop multiple PDF files here'}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  or click to browse files
                </p>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                PDF files up to 10MB each • Select multiple files
              </p>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Selected Files ({files.length})
                  </h3>
                  <button
                    onClick={handleClearFiles}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear All
                  </button>
          </div>

              {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <DocumentTextIcon className="h-8 w-8 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {index + 1}. {file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                      className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}

                <div className="pt-4">
                <button
                  onClick={handleMerge}
                  disabled={files.length < 2 || isMerging}
                    className="w-full rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                    {isMerging ? 'Merging PDFs...' : `Merge ${files.length} PDFs`}
                </button>
              </div>
            </div>
          )}

            {/* Error Display */}
          {error && (
              <div className="mt-6 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

            {/* Features */}
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-2xl bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-gray-900">Preserve Quality</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Merge PDFs without losing quality or formatting.
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-gray-900">Custom Order</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Files are merged in the order you select them.
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-gray-900">Unlimited Files</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Merge as many PDF files as you need into one document.
                </p>
              </div>
            </div>
        </div>
        </div>
      </div>
    </div>
  );
} 