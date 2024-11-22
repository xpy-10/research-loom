import { XataClient } from "../src/xata.js"

export const xata = new XataClient({ apiKey: process.env.XATA_API_KEY })