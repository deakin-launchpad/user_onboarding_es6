import mongoose from "mongoose";
import Config from "../config/index.js";

const { Schema } = mongoose;

const token = new Schema({
    deviceType: { type: String, enum: Object.values(Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES), required: true },
    accessToken: {
        type: String,
        required: true,
        trim: true,
        index: true,
        unique: true,
        sparse: true
    },
    deviceUUID: {
        type: String,
        required: true,
    },
    deviceName: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'user' },
    adminId: { type: Schema.Types.ObjectId, ref: 'admin' },
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: Date.now() }
});

export default mongoose.model('token', token);