export type DoorType = "BEDROOM" | "BATHROOM" | "MAIN_ENTRY"

export interface Site {
  _id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Building {
  _id: string
  name: string
  siteId: string
  createdAt: string
  updatedAt: string
}

export interface Flat {
  _id: string
  flatNo: string
  buildingId: string
  createdAt: string
  updatedAt: string
}

export interface Measurement {
  _id: string
  flatId: string
  doorType: DoorType
  lengthInches: number
  breadthInches: number
  createdAt: string
  updatedAt: string
}
