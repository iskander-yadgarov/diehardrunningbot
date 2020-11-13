import { model } from "mongoose"
import { ICityDocument } from "./city.types"
import CitySchema from "./city.schema"

export const CityModel = model<ICityDocument>('cities', CitySchema)
