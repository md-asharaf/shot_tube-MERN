import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';


const registerUser = asyncHandler(async (req, res) => {
    //get user details from front-end or postman
    const { username, email, password, fullname } = req.body;
    console.log("email: ", email);
    //validation
    if (
        [username, email, password, fullname].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }
    //check if user exists
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }
    //check for images,check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    //upload to cloudinary,avatar
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avatar) {
        throw new ApiError(500, "Failed to upload avatar");
    }
    //create user object - create entry in db
    const user = await User.create({
        email,
        password,
        fullname,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })
    //remove password and refresh token fields from response
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    //check for response
    if (!createdUser) {
        throw new ApiError(500, "Failed to create user");
    }
    //send response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )
})


export { registerUser };