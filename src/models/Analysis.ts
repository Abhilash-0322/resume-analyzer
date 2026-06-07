import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";
import type { AnalysisResult, BulletRewrite, RoleId } from "@/types/analysis";

export interface IAnalysis extends Document {
  userId: Types.ObjectId;
  fileName: string;
  fileType: string;
  resumeText: string;
  jobDescription?: string;
  targetRole?: RoleId;
  result: AnalysisResult;
  rewrites?: BulletRewrite[];
  createdAt: Date;
}

const AnalysisSchema = new Schema<IAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    resumeText: { type: String, required: true },
    jobDescription: { type: String },
    targetRole: { type: String },
    result: { type: Schema.Types.Mixed, required: true },
    rewrites: { type: [Schema.Types.Mixed], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

AnalysisSchema.index({ userId: 1, createdAt: -1 });

const Analysis: Model<IAnalysis> =
  mongoose.models.Analysis || mongoose.model<IAnalysis>("Analysis", AnalysisSchema);

export default Analysis;
