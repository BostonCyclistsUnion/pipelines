import { Generated } from "kysely";

interface BluebikesTable {
  id: Generated<number>;
  tripduration: number;
  "started at": number;
  "ended at": number;
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
  "birth year": number;
  gender: string;
  "postal code": number;
  "rideable type": string;
}

export interface BikeDatabase {
  bluebikes: BluebikesTable;
}
