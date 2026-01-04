import type mongoose from "mongoose"
import { Schema, model, models } from "mongoose"

export interface ISite {
  _id: mongoose.Types.ObjectId
  name: string
  spocName?: string
  spocNumber?: string
  createdAt: Date
  updatedAt: Date
}

const SiteSchema = new Schema<ISite>(
  {
    name: {
      type: String,
      required: [true, "Site name is required"],
      trim: true,
    },
    spocName: {
      type: String,
      trim: true,
    },
    spocNumber: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

export const Site = models.Site || model<ISite>("Site", SiteSchema)
