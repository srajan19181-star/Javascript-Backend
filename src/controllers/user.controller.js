import asynchandler from "../utils/asyncHandler.js"

const registerUser = asynchandler( async (req,res) => {
    return res.status(200).json({
        message:"Something went wrong while registering user"
    })
}) 

export {registerUser}