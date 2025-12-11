import mongoose, { Schema, model, models } from 'mongoose';

const JournalSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
  },
}, { timestamps: true });

const Journal = models.Journal || model('Journal', JournalSchema);

export default Journal;
