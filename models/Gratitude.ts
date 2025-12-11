import mongoose, { Schema, model, models } from 'mongoose';

const GratitudeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  isChecked: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Gratitude = models.Gratitude || model('Gratitude', GratitudeSchema);

export default Gratitude;
