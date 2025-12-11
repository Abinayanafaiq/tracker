import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  name: {
    type: String,
  },
  currentStreakStart: {
    type: Date,
    default: Date.now,
  },
  history: {
    type: [Date], // Array of dates when streaks were reset
    default: [],
  },
}, { timestamps: true });

const User = models.User || model('User', UserSchema);

export default User;
