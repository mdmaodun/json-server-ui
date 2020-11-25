const { v4: uuidv4 } = require('uuid');
const { existsSync, mkdirSync } = require('fs');
const { join, extname } = require('path');
const uploadsDirPath = join(__dirname, '../public/uploads');
if (!existsSync(uploadsDirPath)) {
  mkdirSync(uploadsDirPath, { recursive: true });
}
const acceptFileExtname = [
  '.txt',
  '.md',
  '.xmind',
  '.json',
  '.json5',
  '.xml',
  '.jpg',
  '.png',
  '.jpeg',
  '.gif',
  '.svg',
  '.ppt',
  '.pptx',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.pdf',
  '.zip',
  '.tar',
  '.gz',
  '.tar.gz',
  '.7z',
];
const multer = require('multer');
var storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDirPath);
  },
  filename(req, file, cb) {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    const day = now
      .getDate()
      .toString()
      .padStart(2, '0');
    const hours = now
      .getHours()
      .toString()
      .padStart(2, '0');
    const minutes = now
      .getMinutes()
      .toString()
      .padStart(2, '0');
    const seconds = now
      .getSeconds()
      .toString()
      .padStart(2, '0');
    const milliseconds = now
      .getMilliseconds()
      .toString()
      .padStart(3, '0');

    const dateStr = `${year}${month}${day}-${hours}${minutes}${seconds}-${milliseconds}`;

    cb(null, `${dateStr}-${uuidv4()}${extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    if (acceptFileExtname.includes(extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('NotSupport'));
    }
  },
});

module.exports = (req, res, next) => {
  const { method, path } = req;
  if (method === 'POST' && path === '/upload') {
    upload.array('files', 12)(req, res, (err) => {
      if (err) {
        if (err.message === 'NotSupport') {
          res.status(400).json({
            code: 400,
            msg: 'Contains unsupported file types.',
          });
        } else {
          next(err);
        }
      } else {
        const { host } = req.headers;
        res.json({
          code: 200,
          msg: 'ok.',
          data: {
            files: req.files.map((v) => {
              v.url = `http://${host}/uploads/${v.filename}`;
              return v;
            }),
          },
        });
      }
    });

    return;
  }

  next();
};
