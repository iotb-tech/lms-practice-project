import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: 50
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student"
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive"
    },
    avatarUrl: { type: String },
    profile: {
      bio: String,
      phone: String,
      timezone: { type: String, default: "Africa/Lagos" }
    },
    enrollments: [{
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      status: { type: String, enum: ["enrolled", "completed", "expired"], default: "enrolled" },
      progress: { type: Number, default: 0 },
      completionDate: Date
    }],
    otp: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    lastLoginAt: Date
  },
  { 
    timestamps: true,
    toJSON: { transform: (doc, ret) => { delete ret.passwordHash; } }
  }
);

// ✅ ONLY compound index - NO duplicate email index
userSchema.index({ role: 1, status: 1 });

// ✅ NO pre-save hook - hashing done in userService.js

// ✅ Password comparison method
userSchema.methods.comparePassword = async function(password) {
  if (!this.passwordHash) {
    console.log('❌ No passwordHash for user:', this.email);
    return false;
  }
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.virtual("name").get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

export default mongoose.model("User", userSchema);
