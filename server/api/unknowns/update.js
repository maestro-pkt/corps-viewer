import fs from "node:fs";
// import sqlite3 from 'sqlite3';
import { parseFile } from "music-metadata";
import Database from "better-sqlite3";
const options = {};
const db = new Database(process.env?.SQLITE3_DATABASE, options);

// This broke saving/updating of the database!
//db.pragma("journal_mode = WAL");

export default defineEventHandler(async (event) => {
	console.log("----------------------------------------");
	const { req, res } = event.node;

	// const dbfile = process.env?.SQLITE3_DATABASE;
	// if (!dbfile) return { error: '... error messages' };
	// const db = new sqlite3.Database(dbfile);

	const body = await readBody(event);
	console.log("post unknown body:", body);

	console.log("insert into files table");

	const unkId = body.unkId;
	console.log("Unknown ID:", unkId);

	let finalTime = "Unk";
	let container = "";
	let info = "";
	try {
		console.log("Getting file metadata...");

		const metadata = await parseFile(body.path);

		console.log("Metadata read!");

		container = metadata.format.container;
		info = `${metadata.format.bitrate}|${metadata.format.codec}|${metadata.format.numberOfChannels}|${metadata.format.sampleRate}`;

		let time = metadata.format.duration;
		const minutes = Math.floor(time / 60);
		const seconds = time - minutes * 60;
		const hours = Math.floor(time / 3600);
		time = time - hours * 3600;
		console.log("minutes:", minutes);
		if (!Number.isNaN(minutes)) {
			function str_pad_left(string, pad, length) {
				return (new Array(length + 1).join(pad) + string).slice(-length);
			}

			finalTime = `${str_pad_left(minutes, "0", 2)}:${str_pad_left(
				seconds,
				"0",
				2,
			)}`;
			console.log("finaltime:", finalTime);
		} else {
			console.log("time not a number");
		}

		if (container === undefined) {
			container = "UNK";
		}
	} catch (e) {
		console.error(e);
	}
	// console.log(container);
	try {
		const insertVideo = db.prepare(
			"INSERT INTO files (corpsId, year, path, duration, filetype, fileinfo, dateAdded ) VALUES (?, ?, ?, ?, ?, ?, ?)",
		);
		const insertRes = insertVideo.run(
			body.corpsId,
			body.year,
			body.path,
			finalTime,
			container,
			info,
			body.dateAdded || new Date().toISOString(),
		);

		console.log(insertVideo);
		console.log("Inserted file with key:", insertRes);

		console.log("delete from unknowns where key=", unkId);

		const deleteSql = db.prepare("DELETE FROM unknowns WHERE key=?");

		const res = deleteSql.run(unkId);

		console.log("Deleted unknown with key:", res);

		db.close();
	} catch (e) {
		console.error("Error deleting unknown:", e);
		res.statusCode = 500;
		res.end("Error deleting unknown");
		return;
	}
});
