/* eslint-env node */
const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");
const Duration = require("duration-js");
const humanizeDuration = require("humanize-duration");
const daysHumanizer = humanizeDuration.humanizer({
	largest: 1,
	round: true,
	units: ["d", "h", "m"]
});
const maxHumanizer = humanizeDuration.humanizer({
	largest: 3,
	round: true,
	units: ["y", "mo", "d", "h", "m"]
});

function findAuthor(record, records) {
	// Return the map author if it is not "[unknown]"
	if (record.map_author !== "[unknown]") {
		return record.map_author;
	}

	// Loop backwards through the records to find the author's most recent name
	for (let i = records.length - 1; i >= 0; i--) {
		const r = records[i];
		// Check author and wr holders for matching author steam id to find author name
		if (r.map_author !== "[unknown]" && r.steam_id_author === record.steam_id_author) {
			return r.map_author;
		} else if (r.new_recordholder !== "[unknown]" && r.steam_id_new_recordholder === record.steam_id_author) {
			return r.new_recordholder;
		} else if (r.previous_recordholder && r.previous_recordholder !== "[unknown]" && r.steam_id_previous_recordholder === record.steam_id_author) {
			return r.previous_recordholder;
		}
	}

	// Return "[unknown]" if no other author was found
	return "[unknown]";
}

function createMapListEntry(record, records) {
	// If the map author is "[unknown]" try to find the author's name in other records
	const author = (record.map_author === "[unknown]") ? findAuthor(record, records) : record.map_author;
	// Compute the standing duration in milliseconds
	const standingFor = new Date() - Date.parse(record.fetch_time);
	// Compute the previously stood for duration in milliseconds
	const stoodFor = (record.previousRecord) ? Date.parse(record.fetch_time) - Date.parse(record.previousRecord.fetch_time) : 0;
	// Add the map, standing duration, and author to the list
	return {
		...record,
		standingFor,
		stoodFor,
		author
	};
}

function findLongestStandingRecordPerMap(records) {
	// Create an object to store the maps and their latest record
	const maps = {};
	for (const record of records) {
		if (!record.workshop_item_id) {
			record.workshop_item_id = "[Official]"; // eslint-disable-line camelcase
		}

		// If this map is not already in the maps object, add it
		if (!maps[record.workshop_item_id]) {
			maps[record.workshop_item_id] = {};
		}
		// If this map is not already in the maps object, add it
		if (!maps[record.workshop_item_id][record.mode]) {
			if (record.workshop_item_id !== "[Official]") {
				maps[record.workshop_item_id][record.mode] = record;
			} else {
				maps[record.workshop_item_id][record.mode] = { type: "official" };
			}
		}
		if (!maps[record.workshop_item_id][record.mode][record.map_name] && record.workshop_item_id === "[Official]") {
			maps[record.workshop_item_id][record.mode][record.map_name] = record;
		}
		// If this record is more recent than the existing record for this map, update it
		if (record.workshop_item_id !== "[Official]") {
			if (Date.parse(record.fetch_time) > Date.parse(maps[record.workshop_item_id][record.mode].fetch_time)) {
				const temp = maps[record.workshop_item_id][record.mode];
				maps[record.workshop_item_id][record.mode] = record;
				maps[record.workshop_item_id][record.mode].previousRecord = temp;
			}
		} else {
			if (Date.parse(record.fetch_time) > Date.parse(maps[record.workshop_item_id][record.mode][record.map_name].fetch_time)) {
				const temp = maps[record.workshop_item_id][record.mode][record.map_name];
				maps[record.workshop_item_id][record.mode][record.map_name] = record;
				maps[record.workshop_item_id][record.mode][record.map_name].previousRecord = temp;
			}
		}
	}
	// Compute the standing duration of each map's world record
	const mapList = [];
	for (const modes of Object.values(maps)) {
		for (const record of Object.values(modes)) {
			if (record.type === "official") {
				for (const official of Object.values(record)) {
					if (official === "official") continue;
					mapList.push(createMapListEntry(official, records));
				}
			} else {
				mapList.push(createMapListEntry(record, records));
			}
		}
	}
	// Convert the duration to a human-readable string for each map
	for (const map of mapList) {
		// Add a human-readable duration string
		map.standingForStr = daysHumanizer(map.standingFor);
		map.standingForMaxStr = maxHumanizer(map.standingFor);
		if (map.stoodFor) {
			map.stoodForStr = daysHumanizer(map.stoodFor);
			map.stoodForMaxStr = maxHumanizer(map.stoodFor);
		}

		if (map.mode !== "Stunt") {
			const tempRegex = /^(\d{2}):(\d{2}):(\d{2})\.(\d{2})$/gi;
			const tempRepl = "$1h $2m $3s $40ms";
			// console.log(map);
			map.record_new = readableTime(map.record_new.replace(tempRegex, tempRepl));
		}
	}
	// Sort the maps by duration
	mapList.sort((a, b) => b.standingFor - a.standingFor);
	// Add an id to each entry
	mapList.forEach((map, index) => {
		map.id = index;
	});
	// Return the list of maps sorted by duration
	return mapList;
}

function readableTime(time) {
	let dur = new Duration(time);

	const h = dur.hours();
	const hours = (h !== 0) ? `${h}:` : "";
	dur = new Duration(dur - Duration.parse(`${h}h`));

	const m = dur.minutes();
	const minutes = (m !== 0) ? (m >= 10) ? `${m}:` : (h !== 0) ? `0${m}:` : `${m}:` : (h !== 0) ? "00:" : "";
	dur = new Duration(dur - Duration.parse(`${m}m`));

	const s = dur.seconds();
	const seconds = (s !== 0) ? (s >= 10) ? `${s}.` : (m !== 0) ? `0${s}.` : `${s}.` : (m === 0 && h === 0) ? "0." : "00.";
	dur = new Duration(dur - Duration.parse(`${s}s`));

	const ms = dur.milliseconds();
	const milliseconds = (ms !== 0) ? (ms >= 10) ? (ms >= 100) ? `${ms}` : `0${ms}` : `00${ms}` : "000";
	return `${hours}${minutes}${seconds}${milliseconds.slice(0, milliseconds.length-1)}${(minutes==="")?"s":""}`;
}

async function saveJSONToFile(json, fullpath) {
	// Save the JSON output to a file
	try {
		await fs.writeFile(path.join(fullpath), JSON.stringify(json));
	} catch (err) {
		console.error("err", err);
	}
}


async function main() {
	try {
		let json;
		const distDir = process.cwd();
		const outputExists = await fs.access(path.join(distDir, "changelist.json")).then(() => true).catch(() => false);
		if (outputExists) {
			// Read the JSON changelist from a file
			console.log("Reading JSON changelist from file...");
			const data = await fs.readFile(path.join(distDir, "changelist.json"), "utf8");
			json = JSON.parse(data);
		} else {
			// Fetch the changelist from the server
			console.log("Fetching changelist from server...");
			const res = await axios.get("http://seekr.pw/distance-log/changelist.json");
			// Save the JSON changelist to a file
			console.log("Saving JSON changelist to file...");
			await saveJSONToFile(res.data, path.join(distDir, "changelist.json"));
			json = res.data;
		}
		// Find the longest standing record per map
		console.log("Finding longest standing records...");
		const result = findLongestStandingRecordPerMap(json);
		const publicDir = path.join(process.cwd(), "public");
		// Check if 'dist' directory exists, create it if not
		const publicExists = await fs.access(publicDir).then(() => true).catch(() => false);
		if (!publicExists) {
			console.log("Creating 'public' directory...");
			await fs.mkdir(publicDir);
		}
		// Save the JSON output to a file
		console.log("Saving JSON output to file...");
		await saveJSONToFile(result, path.join(process.cwd(), "public", "output.json"));
		console.log("Done!");
	} catch (err) {
		console.error("err", err);
	}
}

main();
