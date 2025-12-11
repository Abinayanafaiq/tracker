import mongoose, { Schema, model, models } from 'mongoose';

const HabbitSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a habit name'],
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily',
  },
  completedDates: {
    type: [Date],
    default: [],
  },
}, { timestamps: true });

const Habbit = models.Habbit || model('Habbit', HabbitSchema);

export default Habbit;
