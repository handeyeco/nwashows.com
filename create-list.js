import fs from "fs";
import path from "path";
import { tsvParse } from "d3-dsv";

import venues from "./venues.js";

const unprocessedDir = "tsv";
const unprocessableFiles = [];
const unprocessableListings = [];

const keyMap = {
  "List of bands/performers": "lineup",
  "Event name": "title",
  "Event link": "eventLink",
  "Event date": "date",
  "Event time": "time",
  Venue: "venue",
  "Venue name": "venueName",
  "Venue link": "venueLink",
};
function convertKeys(listing) {
  const rv = {};
  Object.entries(listing).forEach(([key, value]) => {
    const newKey = keyMap[key];
    if (newKey) {
      rv[newKey] = value;
    }
  });
  return rv;
}

function matchVenues(listing) {
  const venue = venues[listing.venue];
  if (venue) {
    listing.venueName = venue.name;
    listing.venueLink = venue.link;
  }
  return listing;
}

function normalizeDateTime(listing) {
  let [month, day, year] = listing.date.split("/");
  let [time, ampm] = listing.time.split(" ");
  let [hours, minutes, _] = time.split(":");

  if (month.length === 1) {
    month = "0" + month;
  }

  if (day.length === 1) {
    day = "0" + day;
  }

  let parsedHours = parseInt(hours);
  if (ampm === "PM" && parsedHours !== 12) {
    parsedHours += 12;
  }

  listing.date = `${year}-${month}-${day}`;
  listing.time = `${parsedHours}:${minutes}`;
  return listing;
}

const requiredKeys = ["lineup", "eventLink", "date", "time", "venueName"];
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}$/;
function validate(listing) {
  for (let key of requiredKeys) {
    if (!listing[key]) {
      throw new Error("Listing missing required key: " + key);
    }
  }

  if (!dateRegex.test(listing.date)) {
    throw new Error("Listing has invalid date: " + listing.date);
  }

  if (!timeRegex.test(listing.time)) {
    throw new Error("Listing has invalid time: " + listing.time);
  }

  return listing;
}

function processFileData(data) {
  const processed = [];
  data.forEach((elem) => {
    try {
      const p = validate(normalizeDateTime(matchVenues(convertKeys(elem))));
      processed.push(p);
    } catch (err) {
      // problem formatting or didn't pass validation
      unprocessableListings.push(elem);
    }
  });
  return processed;
}

fs.readdir(unprocessedDir, (err, files) => {
  if (err) {
    return console.error("Unable to scan directory: " + err);
  }

  let combinedList = [];

  files.forEach((file) => {
    try {
      let data = fs.readFileSync(path.join(unprocessedDir, file), "utf8");
      data = tsvParse(data);

      // file is formatted weird
      if (!Array.isArray(data)) {
        console.error("Expected an array from TSV parsing");
        unprocessableFiles.push(file);
        return;
      }

      const processed = processFileData(data);
      combinedList = [...combinedList, ...processed];
    } catch (err) {
      // couln't open file
      console.error(`Couldn't open the file: ` + err);
      unprocessableFiles.push(file);
    }
  });

  if (unprocessableFiles.length || unprocessableListings.length) {
    console.error(`Some things couldn't get processed`);
    console.error("Unprocessable files:");
    console.log(unprocessableFiles);
    console.error("Unprocessable listings:");
    console.log(unprocessableListings);
  }

  try {
    let jsified = `const __the__list__ = ${JSON.stringify(
      combinedList,
      null,
      2
    )};`;
    fs.writeFileSync("list.js", jsified, "utf8");
  } catch (err) {
    // couldn't write file
    console.error(`Couldn't write file: ` + err);
    throw err;
  }
});
