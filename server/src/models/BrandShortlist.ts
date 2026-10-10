import mongoose, { Schema, Document } from 'mongoose';

export interface IBrandShortlist extends Document {
  brandUserId: mongoose.Types.ObjectId;
  campaignBriefId?: mongoose.Types.ObjectId;
  name: string;
  creatorUserIds: mongoose.Types.ObjectId[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BrandShortlistSchema = new Schema<IBrandShortlist>(
  {
    brandUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    campaignBriefId: { type: Schema.Types.ObjectId, ref: 'CampaignBrief' },
    name: { type: String, required: true, default: 'My Creator Shortlist', trim: true },
    creatorUserIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

BrandShortlistSchema.index({ brandUserId: 1, name: 1 });

export const BrandShortlist = mongoose.model<IBrandShortlist>('BrandShortlist', BrandShortlistSchema);
