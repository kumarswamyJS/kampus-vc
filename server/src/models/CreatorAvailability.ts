import mongoose, { Schema, Document } from 'mongoose';

export interface IBookingInquiry {
  _id: mongoose.Types.ObjectId;
  brandUserId: mongoose.Types.ObjectId;
  projectTitle: string;
  startDate: Date;
  endDate: Date;
  offeredBudget?: number;
  currency?: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: Date;
}

export interface ICreatorAvailability extends Document {
  creatorUserId: mongoose.Types.ObjectId;
  isAcceptingInquiries: boolean;
  weeklyCapacityHours: number;
  timezone: string;
  blockedDates: string[]; // YYYY-MM-DD
  inquiries: IBookingInquiry[];
  createdAt: Date;
  updatedAt: Date;
}

const BookingInquirySchema = new Schema<IBookingInquiry>({
  brandUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  projectTitle: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  offeredBudget: { type: Number },
  currency: { type: String, default: 'INR' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'declined', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const CreatorAvailabilitySchema = new Schema<ICreatorAvailability>(
  {
    creatorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    isAcceptingInquiries: { type: Boolean, default: true },
    weeklyCapacityHours: { type: Number, default: 40 },
    timezone: { type: String, default: 'Asia/Kolkata' },
    blockedDates: [{ type: String }],
    inquiries: [BookingInquirySchema],
  },
  { timestamps: true }
);

export const CreatorAvailability = mongoose.model<ICreatorAvailability>('CreatorAvailability', CreatorAvailabilitySchema);
