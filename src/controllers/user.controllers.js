import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //get user details from front-end or postman
    const { username, email, password, fullname } = req.body;
    //validation
    if (
        [username, email, password, fullname].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }
    //check if user exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }
    //check for images,check for avatar
    let avatarLocalPath, coverImageLocalPath;
    if (req.files) {
        if (req.files.avatar && req.files.avatar.length > 0) {
            avatarLocalPath = req.files.avatar[0]?.path;
        }
        if (req.files.coverImage && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0]?.path;
        }
    }

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
    const createdUser = await User.findById(user._id)?.select("-password -refreshToken");
    //check for response
    if (!createdUser) {
        throw new ApiError(500, "Failed to create user");
    }
    //send response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    //get user details from front-end or postman
    const { username, email, password } = req.body;
    //validate details
    if (!username && !email) {
        throw new ApiError(400, "either username or email is required")
    }
    if (!password) {
        throw new ApiError(400, "password is required")
    }
    //check if user exists
    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (!existedUser) {
        throw new ApiError(404, "User not found");
    }
    //check if password is correct
    const isPasswordCorrect = await existedUser.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid username or password");
    }
    //generate token
    const { accessToken, refreshToken } = await generateTokens(existedUser._id);
    //send response in cookies
    const loggedInUser = await User.findById(existedUser._id).select("-password -refreshToken");
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, {
            user: loggedInUser,
            accessToken,
            refreshToken,
        }, "user logged in successfully"))
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        }
    })
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).
        clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged out successfully"))
})

export { registerUser, loginUser, logoutUser };