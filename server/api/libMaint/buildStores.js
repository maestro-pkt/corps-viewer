// import sqlite3 from 'sqlite3';
import sqlite3 from "better-sqlite3";
import fs from "fs-extra/esm";
import { join } from "node:path";

const dataPath = process.env?.DATA_PATH;

console.log("dataPath", dataPath);

const dbfile = process.env?.SQLITE3_DATABASE;
console.log("dbfile", dbfile);
const db = new sqlite3(dbfile);

export const getVideos = () => {
	const query2 = db.prepare(
		`select 
    files.key,
files.corpsId, 
files.title as filetitle, 
files.path,
files.duration,
files.resolution,
files.filetype,
files.fileinfo,
scores.year,
scores.division,
scores.name,
scores.position,
scores.score,
scores.rep,
scores.title as showtitle

from files inner join scores on files.corpsId = scores.corpsId and files.year = scores.year`,
		//"select * from files inner join scores on files.corpsId = scores.corpsId and files.year = scores.year",
	);
	// Execute the prepared statement and log the result set.
	return query2.all();
};

export default defineEventHandler(() => {
	if (!dbfile) return { error: "... error messages" };

	const corpsList = [];

	const byCorps = {}; /*
corpsId => {
  corpsname
  history
  years => {
    1980 => {
      score
      place
      rep
      shows => [{
      (info from files table)
      }]
}
    }
  }
*/

	const byYears = {}; /*
year => {
  corpsId => {
    corpsname
    history
    score
    place
    shows => [{
      (info from files table)
      }]
    }
  }
*/

	const unknowns = {};

	// This is every video that has been associated to a corps
	const allVideos = getVideos();

	for (const oneVideo of allVideos) {
		// console.log(oneVideo);

		const idx = corpsList.findIndex((c) => c.corpsId === oneVideo.corpsId);
		if (idx === -1) {
			corpsList.push({
				corpsId: oneVideo.corpsId,
				name: oneVideo.name,
			});
		}

		// biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
		if (!byCorps.hasOwnProperty(oneVideo.corpsId)) {
			byCorps[oneVideo.corpsId] = {
				corpsId: oneVideo.corpsId,
				name: oneVideo.name,
				years: {},
			};
		}

		// biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
		if (!byCorps[oneVideo.corpsId].years.hasOwnProperty(oneVideo.year)) {
			byCorps[oneVideo.corpsId].years[oneVideo.year] = {
				year: oneVideo.year,
				division: oneVideo.division,
				score: oneVideo.score,
				position: oneVideo.position,
				title: oneVideo.showtitle,
				rep: oneVideo.rep,
				shows: [],
			};
		}

		byCorps[oneVideo.corpsId].years[oneVideo.year].shows.push({
			year: oneVideo.year,
			fileinfo: oneVideo.fileinfo,
			filetype: oneVideo.filetype,
			duration: oneVideo.duration,
			resolution: oneVideo.resolution,
			title: oneVideo.filetitle,
			path: oneVideo.path,
			key: oneVideo.key,
		});

		// biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
		if (!byYears.hasOwnProperty(oneVideo.year)) {
			byYears[oneVideo.year] = {};
		}

		// biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
		if (!byYears[oneVideo.year].hasOwnProperty(oneVideo.corpsId)) {
			byYears[oneVideo.year][oneVideo.corpsId] = {
				corpsId: oneVideo.corpsId,
				name: oneVideo.name,
				score: oneVideo.score,
				position: oneVideo.position,
				title: oneVideo.showtitle,
				rep: oneVideo.rep,
				shows: [],
				division: oneVideo.division,
			};
		}

		byYears[oneVideo.year][oneVideo.corpsId].shows.push({
			fileinfo: oneVideo.fileinfo,
			filetype: oneVideo.filetype,
			duration: oneVideo.duration,
			resolution: oneVideo.resolution,
			title: oneVideo.filetitle,
			path: oneVideo.path,
			key: oneVideo.key,
		});
	}

	fs.writeJSONSync(join(dataPath, "byCorps.json"), byCorps);
	fs.writeJSONSync(join(dataPath, "byYears.json"), byYears);
	fs.writeJSONSync(join(dataPath, "corpsList.json"), corpsList);

	return "done";
});
