/**
 * TODO: Check last blue bike entry in DB and only download if timestamp greater
 */

import JSZip from "jszip";
import { parse } from "papaparse";
import downloadHelper from "../../downloadHelpers";
import db from "../../db";
const { cache } = downloadHelper("bluebike");

async function fetchInitial() {
  let res = await fetch("https://s3.amazonaws.com/hubway-data");
  let elements: string[] = [];
  let i = 0;
  await new HTMLRewriter()
    .on("Key", {
      element(el) {
        elements.push("");
        i++;
      },
      text(t) {
        elements[i - 1] += t.text;
      },
    })
    .transform(res)
    .text();
  return elements;
}

async function* downloadFiles(files: string[]) {
  for (const f of files) {
    let hasCache = cache.exists(f.replace("zip", "csv"));

    if (hasCache) {
      yield f.replace("zip", "csv");
      continue;
    }

    let fileRes = hasCache
      ? new Response()
      : await fetch("https://s3.amazonaws.com/hubway-data/" + f, {
          headers: {
            "accept-encoding": "gzip,deflate",
          },
        });

    if (f.endsWith(".zip") && !hasCache) {
      let data = hasCache
        ? Bun.file("./cache/bluebike/" + f).arrayBuffer()
        : fileRes.arrayBuffer();
      let unzipped = await JSZip.loadAsync(data);
      let file =
        unzipped.file(f.replace("zip", "csv")) ||
        // 201801_hubway_tripdata.csv
        unzipped.file(f.replace("zip", "csv").replaceAll("-", "_"))!;
      let fi = await file.async("text");
      cache.write(f.replace("zip", "csv"), fi);
      yield f.replace("zip", "csv");
    } else if (f.endsWith(".csv") || hasCache) {
      let text = hasCache
        ? await Bun.file("./cache/bluebike/" + f.replace("zip", "csv")).text()
        : await fileRes.text();
      cache.write(f.replace("zip", "csv"), text);
      yield f.replace("zip", "csv");
    }
  }
}

let last = new Set();
for await (let fi of downloadFiles(await fetchInitial())) {
  if (
    [
      "previous_Hubway_Stations_as_of_July_2017.csv",
      "Hubway_Stations_as_of_July_2017.csv",
      "Hubway_Stations_2011_2016.csv",
      "current_bluebikes_stations.csv",
    ].includes(fi)
  )
    continue;
  const f = await Bun.file("./cache/bluebike/" + fi).text();
  if (f.includes("Docks") || f.includes("docks")) continue;
  let objs = parse(f, {
    header: true,
    transformHeader: (h) => {
      return h
        .replaceAll("_", " ")
        .replaceAll("latitude", "lat")
        .replaceAll("longitude", "lng")
        .replace("starttime", "started at")
        .replace("stoptime", "ended at")
        .replace("start station id", "start id")
        .replace("end station id", "end id")
        .replace("start station lat", "start lat")
        .replace("start station lng", "start lng")
        .replace("end station lat", "end lat")
        .replace("end station lng", "end lng")
        .replace("bikeid", "ride id")
        .replace("member casual", "usertype")
        .replace("Start date", "started at")
        .replace("End date", "ended at")
        .replace("Start station number", "start id")
        .replace("End station number", "end id")
        .replace("Start station name", "start station name")
        .replace("End station name", "end station name")
        .replace("Bike number", "ride id")
        .replace("Member type", "usertype")
        .replace("Zip code", "postal code")
        .replace("Gender", "gender")
        .replace("Duration", "tripduration");
    },
  }).data;

  await db.transaction().execute(async (trx) => {
    for (const obj of objs) {
      await trx.insertInto("bluebikes").values(obj).execute();
    }
  });
  console.log("inserted " + objs.length + " " + fi);
}

/**
 * In Order oldest -> latest
 * "tripduration","starttime","stoptime","start station id","start station name","start station latitude","start station longitude","end station id","end station name","end station latitude","end station longitude","bikeid","usertype","birth year","gender"
 * "birth year","gender" removed, "postal code" added
 * DRAMA ALERT
 * - tripduration REMOVED
 * - starttime -> started_at
 * - stoptime -> ended_at
 * - "start station id" -> "start_station_id", "start station name" -> start_station_name
 * - same for end
 * - start station latitude -> start_lat, start station longitude -> start_lng
 * - end aint rocket science
 * - bikeid -> ride_id
 * - ADDED rideable_type
 * - postalcode REMOVED
 * - usertype -> member_casual
 */
