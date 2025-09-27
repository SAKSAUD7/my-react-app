import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  CursorArrowRippleIcon,
  DocumentTextIcon,
  PencilIcon,
  Squares2X2Icon,
  EyeDropperIcon,
  ChatBubbleBottomCenterTextIcon,
  BookmarkIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  MinusIcon,
  DocumentArrowUpIcon,
  CheckIcon,
  SparklesIcon,
  ArrowLeftIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const TOOLS = {
  SELECT: 'select',
  TEXT: 'text',
  DRAW: 'draw',
  SHAPES: 'shapes',
  HIGHLIGHT: 'highlight',
  NOTE: 'note',
  STAMP: 'stamp',
  IMAGE: 'image'
};

export default function EditPdf() {
  const navigate = useNavigate();
  
  // Core state
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [activeTool, setActiveTool] = useState(TOOLS.SELECT);
  const [isLoading, setIsLoading] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [zoom, setZoom] = useState(100);
  
  // Tool settings
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState('#FF0000');
  const [textSize, setTextSize] = useState(16);
  const [textColor, setTextColor] = useState('#000000');
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState([]);
  
  // Refs
  const pdfContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Simple PDF upload and display
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    
    if (!file) {
      toast.error('No file selected');
      return;
    }

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File too large. Please use a PDF smaller than 50MB');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Loading your PDF...');

    try {
      // Create object URL for the PDF
      const url = URL.createObjectURL(file);
      setPdfFile(file);
      setPdfUrl(url);
      setAnnotations([]);
      
      console.log('PDF loaded successfully:', file.name);
      toast.success('PDF loaded! Ready for editing.', { id: loadingToast });
    } catch (error) {
      console.error('PDF loading error:', error);
      toast.error('Failed to load PDF. Please try again.', { id: loadingToast });
      setPdfFile(null);
      setPdfUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    maxSize: 50 * 1024 * 1024,
    disabled: isLoading
  });

  // Set up canvas overlay
  useEffect(() => {
    if (pdfUrl && canvasRef.current && pdfContainerRef.current) {
      const canvas = canvasRef.current;
      const container = pdfContainerRef.current;
      
      // Make canvas overlay the PDF
      const resizeCanvas = () => {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        redrawAnnotations();
      };
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [pdfUrl]);

  // Redraw all annotations on canvas
  const redrawAnnotations = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    annotations.forEach(annotation => {
      switch (annotation.type) {
        case 'text':
          ctx.fillStyle = annotation.color;
          ctx.font = `${annotation.size}px Arial`;
          ctx.fillText(annotation.text, annotation.x, annotation.y);
          break;
          
        case 'rectangle':
          ctx.strokeStyle = annotation.color;
          ctx.lineWidth = 2;
          ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
          break;
          
        case 'highlight':
          ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
          ctx.fillRect(annotation.x, annotation.y, annotation.width, annotation.height);
          break;
          
        case 'note':
          // Yellow sticky note
          ctx.fillStyle = '#ffeb3b';
          ctx.fillRect(annotation.x, annotation.y, 80, 80);
          ctx.strokeStyle = '#fbc02d';
          ctx.strokeRect(annotation.x, annotation.y, 80, 80);
          ctx.fillStyle = '#333';
          ctx.font = '12px Arial';
          ctx.fillText(annotation.text, annotation.x + 5, annotation.y + 20);
          break;
          
        case 'stamp':
          ctx.fillStyle = '#d32f2f';
          ctx.font = 'bold 16px Arial';
          ctx.fillText(annotation.text, annotation.x, annotation.y);
          ctx.strokeStyle = '#d32f2f';
          ctx.strokeText(annotation.text, annotation.x, annotation.y);
          break;
          
        case 'drawing':
          if (annotation.points && annotation.points.length > 1) {
            ctx.strokeStyle = annotation.color;
            ctx.lineWidth = annotation.size;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
            annotation.points.forEach(point => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
          }
          break;
          
        case 'image':
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, annotation.x, annotation.y, annotation.width, annotation.height);
          };
          img.src = annotation.src;
          break;
      }
    });
  };

  // Redraw when annotations change
  useEffect(() => {
    redrawAnnotations();
  }, [annotations]);

  // Handle canvas interactions
  const handleCanvasMouseDown = (e) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (activeTool === TOOLS.DRAW) {
      setIsDrawing(true);
      setCurrentStroke([{ x, y }]);
    } else {
      addAnnotation(x, y);
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing || activeTool !== TOOLS.DRAW || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentStroke(prev => [...prev, { x, y }]);
    
    // Draw current stroke in real-time
    const ctx = canvas.getContext('2d');
    if (currentStroke.length > 0) {
      const lastPoint = currentStroke[currentStroke.length - 1];
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing && currentStroke.length > 0) {
      const annotation = {
        id: Date.now(),
        type: 'drawing',
        points: currentStroke,
        color: brushColor,
        size: brushSize
      };
      setAnnotations(prev => [...prev, annotation]);
    }
    setIsDrawing(false);
    setCurrentStroke([]);
  };

  // Add different types of annotations
  const addAnnotation = (x, y) => {
    let annotation = null;
    
    switch (activeTool) {
      case TOOLS.TEXT:
        const text = prompt('Enter text:') || 'Sample Text';
        annotation = {
          id: Date.now(),
          type: 'text',
          text,
          x,
          y,
          size: textSize,
          color: textColor
        };
        break;
        
      case TOOLS.SHAPES:
        annotation = {
          id: Date.now(),
          type: 'rectangle',
          x,
          y,
          width: 100,
          height: 60,
          color: brushColor
        };
        break;
        
      case TOOLS.HIGHLIGHT:
        annotation = {
          id: Date.now(),
          type: 'highlight',
          x,
          y,
          width: 120,
          height: 20
        };
        break;
        
      case TOOLS.NOTE:
        const noteText = prompt('Enter note:') || 'Note';
        annotation = {
          id: Date.now(),
          type: 'note',
          text: noteText,
          x,
          y
        };
        break;
        
      case TOOLS.STAMP:
        const stamps = ['APPROVED', 'REJECTED', 'DRAFT', 'CONFIDENTIAL', 'URGENT', 'REVIEWED'];
        const stampText = stamps[Math.floor(Math.random() * stamps.length)];
        annotation = {
          id: Date.now(),
          type: 'stamp',
          text: stampText,
          x,
          y
        };
        break;
    }
    
    if (annotation) {
      setAnnotations(prev => [...prev, annotation]);
      toast.success(`${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} added!`);
    }
  };

  // Image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const annotation = {
        id: Date.now(),
        type: 'image',
        src: e.target.result,
        x: 50,
        y: 50,
        width: 200,
        height: 150
      };
      
      setAnnotations(prev => [...prev, annotation]);
      toast.success('Image added!');
    };
    reader.readAsDataURL(file);
  };

  // Remove all annotations
  const removeAll = () => {
    setAnnotations([]);
    toast.success('All annotations removed');
  };

  // Undo last annotation
  const undo = () => {
    if (annotations.length > 0) {
      setAnnotations(prev => prev.slice(0, -1));
      toast.success('Last annotation removed');
    }
  };

  // Download function
  const downloadPdf = async () => {
    if (!canvasRef.current) {
      toast.error('No annotations to download');
      return;
    }

    setIsLoading(true);
    const downloadToast = toast.loading('Preparing download...');

    try {
      // Download canvas as image
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL('image/png', 1.0);
      
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `edited-${pdfFile?.name || 'document'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Annotations downloaded as image!', { id: downloadToast });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download', { id: downloadToast });
    } finally {
      setIsLoading(false);
    }
  };

  const tools = [
    { id: TOOLS.SELECT, icon: CursorArrowRippleIcon, label: 'Select' },
    { id: TOOLS.TEXT, icon: DocumentTextIcon, label: 'Text' },
    { id: TOOLS.DRAW, icon: PencilIcon, label: 'Draw' },
    { id: TOOLS.SHAPES, icon: Squares2X2Icon, label: 'Shapes' },
    { id: TOOLS.HIGHLIGHT, icon: EyeDropperIcon, label: 'Highlight' },
    { id: TOOLS.NOTE, icon: ChatBubbleBottomCenterTextIcon, label: 'Note' },
    { id: TOOLS.STAMP, icon: BookmarkIcon, label: 'Stamp' },
    { id: TOOLS.IMAGE, icon: PhotoIcon, label: 'Image' },
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#C0C0C0'
  ];

  if (!pdfFile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 mb-6"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Tools
            </button>
            
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
                <SparklesIcon className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PDF Editor
                </span>
              </h1>
              <p className="text-xl text-gray-600">
                Edit PDF by adding text, shapes, comments and highlights. Your secure and simple tool to edit PDF.
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-2xl">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50 scale-105' 
                  : 'border-gray-300 hover:border-blue-400 bg-white'
              } ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
            >
              <input {...getInputProps()} />
              
              <div className="space-y-6">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  ) : (
                    <DocumentArrowUpIcon className="h-12 w-12 text-white" />
                  )}
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {isLoading ? 'Loading PDF...' : isDragActive ? 'Drop PDF here' : 'Select PDF file'}
                  </h3>
                  <p className="text-gray-500">
                    {isLoading ? 'Processing your PDF...' : isDragActive ? 'Release to upload' : 'or drop PDF here'}
                  </p>
                </div>
                
                {!isLoading && (
                  <div className="flex justify-center space-x-8 text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <CheckIcon className="h-5 w-5 text-green-500" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckIcon className="h-5 w-5 text-green-500" />
                      <span>Private</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckIcon className="h-5 w-5 text-green-500" />
                      <span>Free</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Supported: PDF files up to 50MB • Works offline • No external dependencies
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PDF Editor</h1>
                <p className="text-sm text-gray-500">{pdfFile?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{annotations.length} annotations</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Toolbar */}
          <div className="bg-gray-50 border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {tools.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => {
                      if (id === TOOLS.IMAGE) {
                        fileInputRef.current?.click();
                      } else {
                        setActiveTool(id);
                      }
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTool === id
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                    title={label}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:block">{label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={undo}
                  disabled={annotations.length === 0}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Undo last annotation"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={removeAll}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium bg-white border rounded-lg hover:bg-gray-50"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Remove all</span>
                </button>
                <button
                  onClick={downloadPdf}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  <span>{isLoading ? 'Saving...' : 'Download'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex h-[700px]">
            {/* Sidebar */}
            <div className="w-80 bg-gray-50 border-r p-6 overflow-y-auto">
              {/* Zoom */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Zoom</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setZoom(Math.max(zoom - 25, 50))}
                    className="p-2 rounded-lg border hover:bg-gray-100"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium w-16 text-center">{zoom}%</span>
                  <button
                    onClick={() => setZoom(Math.min(zoom + 25, 200))}
                    className="p-2 rounded-lg border hover:bg-gray-100"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Tool Settings */}
              {(activeTool === TOOLS.DRAW || activeTool === TOOLS.SHAPES) && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Drawing Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-700 mb-2">
                        Size: {brushSize}px
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-2">Color</label>
                      <div className="grid grid-cols-7 gap-1">
                        {colors.map(color => (
                          <button
                            key={color}
                            onClick={() => setBrushColor(color)}
                            className={`w-6 h-6 rounded border-2 ${
                              brushColor === color ? 'border-gray-800' : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTool === TOOLS.TEXT && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Text Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-700 mb-2">
                        Size: {textSize}px
                      </label>
                      <input
                        type="range"
                        min="8"
                        max="48"
                        value={textSize}
                        onChange={(e) => setTextSize(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-2">Color</label>
                      <div className="grid grid-cols-7 gap-1">
                        {colors.map(color => (
                          <button
                            key={color}
                            onClick={() => setTextColor(color)}
                            className={`w-6 h-6 rounded border-2 ${
                              textColor === color ? 'border-gray-800' : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Instructions</h3>
                <div className="text-xs text-gray-500 space-y-2">
                  <p>• Select a tool from the toolbar</p>
                  <p>• Click on the PDF to add elements</p>
                  <p>• Use draw tool for freehand drawing</p>
                  <p>• Adjust colors and sizes in settings</p>
                  <p>• Download annotations as image</p>
                </div>
              </div>

              {/* Annotations List */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Annotations ({annotations.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {annotations.map((annotation, index) => (
                    <div key={annotation.id} className="flex items-center justify-between p-2 bg-white rounded text-xs">
                      <span className="capitalize">{annotation.type}</span>
                      <button
                        onClick={() => {
                          setAnnotations(prev => prev.filter(a => a.id !== annotation.id));
                          toast.success('Annotation removed');
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {annotations.length === 0 && (
                    <p className="text-xs text-gray-400">No annotations yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* PDF Viewer with Canvas Overlay */}
            <div className="flex-1 bg-gray-100 overflow-auto relative">
              <div className="p-6">
                <div 
                  className="relative bg-white rounded-lg shadow-lg mx-auto"
                  style={{ 
                    width: `${800 * (zoom / 100)}px`,
                    height: `${1000 * (zoom / 100)}px`
                  }}
                >
                  {/* PDF Display */}
                  <div
                    ref={pdfContainerRef}
                    className="absolute inset-0 rounded-lg overflow-hidden"
                  >
                    <embed
                      src={pdfUrl}
                      type="application/pdf"
                      width="100%"
                      height="100%"
                      className="rounded-lg"
                    />
                  </div>
                  
                  {/* Canvas Overlay for Annotations */}
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 rounded-lg cursor-crosshair"
                    style={{ 
                      pointerEvents: activeTool !== TOOLS.SELECT ? 'auto' : 'none',
                      zIndex: 10
                    }}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                  />
                  
                  {/* Tool indicator */}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                    {activeTool.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Processing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
