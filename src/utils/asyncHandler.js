//1st method

// const asynchandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req,res,next);
//     } catch (error) {
//         res.status(500 || error.status).json({
//             success:false,
//             message:error.message || "Internal Server Error"
//         });
//     }
// };

//2nd method

const asynchandler = (requestHandler) => {
    (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((error)=>next(error))
    }
}

export default asynchandler;