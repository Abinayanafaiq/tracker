import mongoose, { Schema, model, models } from 'mongoose';

const MeditationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  duration: {
    type: Number, // in seconds
    required: true,
  },
}, { timestamps: true });

const Meditation = models.Meditation || model('Meditation', MeditationSchema);

export default Meditation;
