const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userName: {
        type:String, 
        required: true,
        unique: true,
        trim:true, 
        },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        },
        createdAt: {
        type: Date,
        default: Date.now,
        },
    }); 

    module.exports = mongoose.model('User', UserSchema)