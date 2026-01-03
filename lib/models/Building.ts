import type mongoose from "mongoose"
import { Schema, model, models } from "mongoose"

export interface IBuilding {
  _id: mongoose.Types.ObjectId
  name: string
  siteId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const BuildingSchema = new Schema<IBuilding>(
  {
    name: {
      type: String,
      required: [true, "Building name is required"],
      trim: true,
    },
    siteId: {
      type: Schema.Types.ObjectId,
      ref: "Site",
      required: [true, "Site ID is required"],
    },
  },
  {
    timestamps: true,
  },
)

BuildingSchema.index({ siteId: 1 })

export const Building = models.Building || model<IBuilding>("Building", BuildingSchema)
