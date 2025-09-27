# FlexiPDF Core

A streamlined version of FlexiPDF containing the most essential PDF tools. This is a 50% subset of the full FlexiPDF application, focusing on the core functionality that users need most.

## Features

### Convert Tools
- **Word to PDF** - Convert Word documents to PDF format instantly
- **PDF to Word** - Convert PDF to editable Word documents  
- **Excel to PDF** - Convert Excel spreadsheets to PDF
- **PDF to Excel** - Convert PDF tables to Excel format
- **PowerPoint to PDF** - Convert presentations to PDF
- **PDF to PowerPoint** - Convert PDF to editable presentations
- **JPG to PDF** - Convert images to PDF documents
- **PDF to JPG** - Convert PDF pages to JPG images

### Organize Tools
- **Merge PDF** - Combine multiple PDFs into one document
- **Split PDF** - Separate pages into independent PDF files
- **Rotate PDF** - Rotate PDF pages to the correct orientation
- **Extract Pages** - Extract specific pages from PDF

### Editor Tools
- **Edit PDF** - Edit text, images, and more in your PDF
- **Add Watermark** - Add text or image watermarks to PDF
- **Sign PDF** - Add digital signatures to your PDF

### Security Tools
- **Protect PDF** - Add password protection to PDF

### Optimize Tools
- **Compress PDF** - Reduce PDF file size while maintaining quality

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- React Hot Toast
- Heroicons
- React Dropzone

### Backend
- Node.js
- Express.js
- PDF-lib
- Multer
- CORS
- Helmet

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SAKSAUD7/my-react-app.git
cd my-react-app
```

2. Install client dependencies:
```bash
cd client
npm install
```

3. Install server dependencies:
```bash
cd ../server
npm install
```

### Development

1. Start the server:
```bash
cd server
npm run dev
```

2. Start the client (in a new terminal):
```bash
cd client
npm run dev
```

The application will be available at `http://localhost:3002`

### Production Build

1. Build the client:
```bash
cd client
npm run build
```

2. Start the production server:
```bash
cd server
npm start
```

## Project Structure

```
flexipdf-core/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components (18 tools)
│   │   ├── utils/         # Utility functions
│   │   └── assets/        # Static assets
│   ├── public/            # Public assets
│   └── package.json
├── server/                # Node.js backend
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── utils/           # Server utilities
│   └── package.json
└── README.md
```

## API Endpoints

- `POST /api/pdf/merge` - Merge multiple PDFs
- `POST /api/pdf/split` - Split PDF into pages
- `POST /api/pdf/compress` - Compress PDF file
- `POST /api/pdf/convert` - Convert between formats
- `POST /api/pdf/edit` - Edit PDF content
- `POST /api/pdf/watermark` - Add watermarks
- `POST /api/pdf/sign` - Add digital signatures
- `POST /api/pdf/protect` - Add password protection
- `POST /api/pdf/rotate` - Rotate PDF pages
- `POST /api/pdf/extract` - Extract specific pages

## Contributing

This is a core subset of FlexiPDF. For the full version with all 35+ tools, please refer to the main FlexiPDF repository.

## License

MIT License - see LICENSE file for details.

## About

FlexiPDF Core provides the essential PDF manipulation tools that cover 90% of common PDF tasks. It's designed to be lightweight, fast, and easy to deploy while maintaining the core functionality users need most. This version includes 18 essential tools across 5 categories: Convert, Organize, Editor, Security, and Optimize.