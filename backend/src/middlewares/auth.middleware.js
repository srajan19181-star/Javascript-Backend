import asyncHandler from "../utils/asyncHandler.js"
import ApiError from  "../utils/ApiErrors.js"

export const verifyJWT = asyncHandler(async(req,_,next) => {            // _ -> res is not used so we use _
    try {
        const token = req.cookies?.accessToken || req.header("Authorisation")?.replace("Bearer","")
    
        if(!token){
            throw new ApiError(401,"Unauthorized request");
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        if(!decodedToken){
            throw new ApiError(401,"Invalid Access Token");
        }
    
        const user = await UserActivation.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(404,"User not found");
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token")
    }
})