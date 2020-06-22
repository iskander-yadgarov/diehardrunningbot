import { model } from "mongoose"
import { IEventDocument } from "./events.types"
import EventSchema from "./events.schema"

// export const EventModel = model<IEventDocument>('event', EventSchema);
export const EventModel = model('event', EventSchema)