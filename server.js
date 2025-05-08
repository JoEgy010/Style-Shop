const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const server = http.createServer((request, response) => {
  console.log(`Requested URL: ${request.url}`);
  
  // تحديد المسار المطلوب، واستخدام index.html كصفحة افتراضية
  let filePath = '.' + request.url;
  if (filePath === './') {
    filePath = './index.html';
  }
  
  // الحصول على امتداد الملف
  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // قراءة وإرسال الملف
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // الملف غير موجود
        console.log(`File not found: ${filePath}`);
        fs.readFile('./index.html', (err, content) => {
          if (err) {
            response.writeHead(500);
            response.end('Error loading index.html');
          } else {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(content, 'utf-8');
          }
        });
      } else {
        // خطأ في السيرفر
        response.writeHead(500);
        response.end(`Server Error: ${error.code}`);
      }
    } else {
      // تم العثور على الملف
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
});