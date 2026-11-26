import data from "../data/activities.json";
import type { Activity } from "./schema";
export const library = data as Activity[];
export const activityById = (id: string) => library.find((a) => a.id === id);
