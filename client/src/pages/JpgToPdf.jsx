import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { ArrowLeftIcon, DocumentArrowUpIcon, PhotoIcon, XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';
import { uploadMultipleFiles } from '../utils/api';
import { downloadBlob } from '../utils/fileUtils';
import toast from 'react-hot-toast';

export default function JpgToPdf() {
  const [files, setFiles] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [pageSize, setPageSize] = useState('A4');
  const [orientation, setOrientation] = useState('auto');
  const [margin, setMargin] = useState(10);
  const navigate = useNavigate();

  const handleFileSelect = (selectedFiles) => {
    const imageFiles = selectedFiles.filter(file => 
      file.type.startsWith('image/') && 
      ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'].includes(file.type)
    );
    
    if (imageFiles.length !== selectedFiles.length) {
      toast.error('Only image files (JPG, PNG, GIF, BMP) are allowed');
    }
    
    setFiles(imageFiles);
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const moveFile = (fromIndex, toIndex) => {
    const newFiles = [...files];
    const [moved] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, moved);
    setFiles(newFiles);
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one image file');
      return;
    }

    setIsConverting(true);
    const loadingToast = toast.loading('Converting images to PDF...');

    try {
      const response = await uploadMultipleFiles('/api/pdf/convert-images-to-pdf', files, {
        pageSize,
        orientation,
        margin: margin.toString()
      });
      
      downloadBlob(response, 'converted-images.pdf');
      toast.success('Images converted to PDF successfully!', { id: loadingToast });
      setFiles([]);
    } catch (error) {
      console.error('Error converting images:', error);
      toast.error(error.message || 'Failed to convert images. Please try again.', { id: loadingToast });
    } finally {
      setIsConverting(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      handleFileSelect([...files, ...acceptedFiles]);
    },
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp']
    },
    multiple: true
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
              Images to PDF
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Convert JPG, PNG, and other image formats to PDF. Arrange images in your preferred order.
            </p>
          </div>

          {/* Settings */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Page Size</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="A4">A4</option>
                <option value="A3">A3</option>
                <option value="A5">A5</option>
                <option value="Letter">Letter</option>
                <option value="Legal">Legal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Orientation</label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="auto">Auto</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Margin (px)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
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
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-base font-semibold text-gray-900">
                  {isDragActive ? 'Drop your images here' : 'Drag and drop images here'}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  or click to browse files
                </p>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                JPG, PNG, GIF, BMP files supported
              </p>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Selected Images ({files.length})</h3>
                  <button
                    onClick={handleConvert}
                    disabled={isConverting}
                    className="rounded-full bg-primary-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isConverting ? 'Converting...' : 'Convert to PDF'}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </span>
                          <button
                            onClick={() => handleRemoveFile(index)}
                            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => index > 0 && moveFile(index, index - 1)}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              <ArrowsPointingInIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => index < files.length - 1 && moveFile(index, index + 1)}
                              disabled={index === files.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              <ArrowsPointingOutIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-2xl bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-gray-900">Multiple Formats</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Support for JPG, PNG, GIF, BMP and other popular image formats.
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-gray-900">Custom Layout</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Choose page size, orientation, and margins for perfect layout.
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-gray-900">Arrange Order</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Drag and rearrange images to set the perfect order in your PDF.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 