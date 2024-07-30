// import multer from "multer";
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './public/temp')
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname)
//     }
// })
// export const upload = multer(
//     {
//         storage
//     }
// )


import multer from "multer";

const multipleUploadSolution = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/temp");
    },

    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const multerUpload = multer({
    storage: multipleUploadSolution,
    limits: { fileSize: 1024 * 1024 * 100 },
});
export {
    multerUpload
};