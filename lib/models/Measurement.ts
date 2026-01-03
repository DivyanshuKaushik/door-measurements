import type mongoose from "mongoose"
import { Schema, model, models } from "mongoose"

export enum DoorType {
  BEDROOM = "BEDROOM",
  BATHROOM = "BATHROOM",
  MAIN_ENTRY = "MAIN_ENTRY",
}

export interface IMeasurement {
  _id: mongoose.Types.ObjectId
  flatId: mongoose.Types.ObjectId
  doorType: DoorType
  lengthInches: number
  breadthInches: number
  createdAt: Date
  updatedAt: Date
}

const MeasurementSchema = new Schema<IMeasurement>(
  {
    flatId: {
      type: Schema.Types.ObjectId,
      ref: "Flat",
      required: [true, "Flat ID is required"],
    },
    doorType: {
      type: String,
      enum: Object.values(DoorType),
      required: [true, "Door type is required"],
    },
    lengthInches: {
      type: Number,
      required: [true, "Length is required"],
      min: [0, "Length must be positive"],
    },
    breadthInches: {
      type: Number,
      required: [true, "Breadth is required"],
      min: [0, "Breadth must be positive"],
    },
  },
  {
    timestamps: true,
  },
)

MeasurementSchema.index({ flatId: 1, doorType: 1 }, { unique: true })

export const Measurement = models.Measurement || model<IMeasurement>("Measurement", MeasurementSchema)
