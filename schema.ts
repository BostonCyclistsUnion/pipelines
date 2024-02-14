import { Generated } from "kysely";

interface BluebikesTable {
  id: Generated<number>;
  tripduration: number;
  "started at": string;
  "ended at": string;
  "start id": number;
  "start station name": string;
  "start lat": number;
  "start lng": number;
  "end id": number;
  "end station name": string;
  "end lat": number;
  "end lng": number;
  "ride id": number;
  usertype: string;
  "birth year": number | null;
  gender: string | null;
  "postal code": number;
  "rideable type": string;
}

export interface BikeDatabase {
  bluebikes: BluebikesTable;
}
