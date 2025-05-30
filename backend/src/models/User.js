import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minLength: 3,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minLlength: 6,
    },
    profileImage: {
        type: String,
        default: "",
    },
}, {
    timestamps: true, 
});

// password hashing before saving the user
userSchema.pre("save", async function (next) {

    // check if password is modified
    if (!this.isModified("password")) {
        return next();
    }


    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();

});

// method to compare password
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password); //  this.password is the hashed password from db
}

const User = mongoose.model("User", userSchema);
export default User;