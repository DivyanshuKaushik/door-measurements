import type mongoose from "mongoose"
import { Schema, model, models } from "mongoose"

export interface IFlat {
  _id: mongoose.Types.ObjectId
  flatNo: string
  buildingId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const FlatSchema = new Schema<IFlat>(
  {
    flatNo: {
      type: String,
      required: [true, "Flat number is required"],
      trim: true,
    },
    buildingId: {
      type: Schema.Types.ObjectId,
      ref: "Building",
      required: [true, "Building ID is required"],
    },
  },
  {
    timestamps: true,
  },
)

FlatSchema.index({ buildingId: 1 })

export const Flat = models.Flat || model<IFlat>("Flat", FlatSchema)
