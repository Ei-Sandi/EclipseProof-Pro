import multer from 'multer';

const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        // Add timestamp to avoid filename conflicts
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const imageFileFilter = (req: any, file: any, cb: any) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, JPG, PNG) are allowed for ID documents'));
    }
};

const pdfFileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed for payslips'));
    }
};

// Upload middleware for ID documents (images)
export const uploadImageDocument = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: imageFileFilter
});

// Upload middleware for payslips (PDFs)
export const uploadPayslip = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: pdfFileFilter
});
