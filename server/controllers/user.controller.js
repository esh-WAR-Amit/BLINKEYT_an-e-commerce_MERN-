import UserModel from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import sendEmail from "../config/sendEmail.js";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from "../utils/generatedRefreshToken.js";
import uploadImageClodinary from "../utils/uploadImageClodinary.js";
import generatOtp from "../utils/generateOtp.js";
import forgotPasswordTemplate from "../utils/forgotPasswordTemplate.js";
import jwt from "jsonwebtoken";

export async function registerUserController(request, response) {
  try {
    const { name, email, password } = request.body;

    if (!name || !email || !password) {
      return response.status(400).json({
        message: "provide email, name, password",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({
      email,
    });

    if (user) {
      return response.json({
        message: "Already registered email || user already exists",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    const payload = {
      name,
      email,
      password: hashPassword,
    };

    const newUser = new UserModel(payload);
    const save = await newUser.save();

    const verifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${save?._id}`;

    //*****************Immediately invoked function expression*****************ie sendEmail is a function call...
    // const verifyEmail = await sendEmail({
    //   sendTo: email,
    //   subject: "Verify e-mail from BLINKEYIT",
    //   html: verifyEmailTemplate({
    //     name,
    //     url: verifyEmailUrl,
    //   }),
    // });

    async function verifyEmail(email, name, verifyEmailUrl) {
      console.log("Verify email", email);
      try {
        const result = await sendEmail({
          sendTo: email,
          subject: "Verify e-mail from BLINKEYIT",
          html: verifyEmailTemplate({
            name,
            url: verifyEmailUrl,
          }),
        });
        console.log("Email sent successfully:", result);
        return result;
      } catch (error) {
        console.error("Error sending email:", error);
        throw error;
      }
    }

    verifyEmail(email, name, verifyEmailUrl);

    console.log("Email:", email);
    console.log("Name:", name);
    console.log("Verify Email URL:", verifyEmailUrl);

    return response.json({
      message: "User created successfully",
      error: false,
      success: true,
      data: save,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function verifyEmailController(request, response) {
  try {
    const { code } = request.body;

    const user = await UserModel.findOne({ _id: code });
    if (!user) {
      return response.status(400).json({
        message: "Invalid code",
        error: true,
        success: false,
      });
    }

    const updateUser = await UserModel.updateOne(
      { _id: code },
      {
        verify_email: true,
      }
    );

    return response.json({
      message: "Verify email done.",
      success: true,
      error: false,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: true,
    });
  }
}

//login controller
export async function loginController(request, response) {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({
        message: "Email and password are required",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return response.status(400).json({
        message: "Invalid email or password",
        error: true,
        success: false,
      });
    }
    //check if user is verified
    if (user.status !== "Active") {
      return response.status(400).json({
        message: "Your account is not active..contact to admin",
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcryptjs.compare(password, user.password);
    if (!checkPassword) {
      return response.status(400).json({
        message: "Invalid password..check your password",
        error: true,
        success: false,
      });
    }

    const accesstoken = await generatedAccessToken(user._id);
    const refreshToken = await generatedRefreshToken(user._id);

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      samesite: "None",
    };
    response.cookie("accessToken", accesstoken, cookiesOption);
    response.cookie("refreshToken", refreshToken, cookiesOption);

    return response.status(200).json({
      message: "Login Successfull",
      error: false,
      success: true,
      data: {
        accesstoken,
        refreshToken,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//logout controller
export async function logoutController(request, response) {
  try {
    const userid = request.userId; //coming from middleware

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      samesite: "None",
    };

    response.clearCookie("accessToken", cookiesOption);
    response.clearCookie("refreshToken", cookiesOption);

    const removeRefreshToken = await UserModel.findByIdAndUpdate(userid, {
      refresh_token: "",
    });

    return response.json({
      message: "Logout Successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//upload user avtar
export async function uploadAvatar(request, response) {
  try {
    const userId = request.userId; // from auth middleware
    const image = request.file; //from multer middleware

    const upload = await uploadImageClodinary(image);

    const updateUser = await UserModel.findByIdAndUpdate(userId, {
      avatar: upload.url,
    });

    return response.json({
      message: "Profile uploaded successfully",
      data: {
        _id: userId,
        avatar: upload.url,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//update user details
export async function updateUserDetails(request, response) {
  try {
    const userId = request.userId; // from auth middleware
    const { name, email, mobile, password } = request.body;

    let hashPassword = "";

    if (password) {
      const salt = await bcryptjs.getSalt(10);
      hashPassword = await bcryptjs.hash(password, salt);
    }

    const updateUser = await UserModel.updateOne(
      { _id: userId },
      {
        ...(name && { name: name }),
        ...(email && { email: email }),
        ...(mobile && { mobile: mobile }),
        ...(password && { password: hashPassword }),
      }
    );
    return response.json({
      message: "User details updated successfully",
      error: false,
      success: true,
      data: updateUser,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//forgot password
export async function forgotPasswordController(request, response) {
  try {
    const { email } = request.body;
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return response.status(404).json({
        message: "User not found..email not available",
        error: true,
        success: false,
      });
    }

    const otp = generatOtp();
    const expireTime = new Date() + 60 * 60 * 1000; //expire in 1hr

    const update = await UserModel.findByIdAndUpdate(user._id, {
      forgot_password_otp: otp,
      forgot_password_expiry: new Date(expireTime).toISOString(),
    });

    await sendEmail({
      sendTo: email,
      subject: "Reset Password for BLINKEYIT login",
      html: forgotPasswordTemplate({
        name: user.name,
        otp: otp,
      }),
    });

    return response.json({
      message: "Otp sent to your email...plz check your registered mail",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//verify forgot password otp
export async function verifyForgotPasswordOtp(request, response) {
  try {
    const { email, otp } = request.body;

    if (!email || !otp) {
      return response.status(400).json({
        message: "Email and otp are required",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return response.status(404).json({
        message: "User not found..email not available",
        error: true,
        success: false,
      });
    }

    const currentTime = new Date().toISOString;

    if (user.forgot_password_expiry < currentTime) {
      return response.status(400).json({
        message: "Otp expired",
        error: true,
        success: false,
      });
    }

    if (otp !== user.forgot_password_otp) {
      return response.status(400).json({
        message: "Invalid otp",
        error: true,
        success: false,
      });
    }

    //if otp is not expired and otp matches
    return response.json({
      message: "Otp verified successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//reset the password
export async function resetPassword(request, response) {
  try {
    const { email, newPassword, confirmPassword } = request.body;

    if (!email || !newPassword || !confirmPassword) {
      return response.status(400).json({
        message:
          "Please fill all the fields namely email, newPassword, confirmPassword",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return response.status(400).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return response.status(400).json({
        message: "New Password and Confirm Password must be same",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    const update = await UserModel.findOneAndUpdate(user._id, {
      password: hashedPassword,
    });

    return response.json({
      message: "Password reset successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//refresh token controller
export async function refreshToken(request, response) {
  try {
    const refreshToken =
      request.cookies.refreshToken ||
      request?.header?.authorization?.split(" ")[1]; //'Bearer token' => [Bearer token]

    if (!refreshToken) {
      return response.status(401).json({
        message: "Unauthorized... Invalid Token",
        error: true,
        success: false,
      });
    }

    const verifyToken = await jwt.verify(
      refreshToken,
      process.env.SECRET_KEY_REFRESH_TOKEN
    );

    if (!verifyToken) {
      return response.status(401).json({
        message: "Unauthorized... Invalid Token..Token expired",
        error: true,
        success: false,
      });
    }

    const userId = verifyToken?._id;

    const newAccessToken = await generatedAccessToken(userId);

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      samesite: "None",
    };

    response.cookie("accessToken", newAccessToken, cookiesOption);

    return response.json({
      message: "New Access Token generated",
      error: false,
      success: true,
      data: {
        newAccessToken: newAccessToken,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}
