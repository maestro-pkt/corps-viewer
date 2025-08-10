
// to run:
//  SQLITE3_DATABASE='/mnt/s/corps-player/data/dci-2.db' node downloadScoresFromDcx.js 

import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import sqlite3 from "better-sqlite3";

const dbfile = process.env?.SQLITE3_DATABASE;
console.log("dbfile", dbfile);
const db = new sqlite3(dbfile);
 const dbInsertScores = db.prepare(
	"INSERT INTO scores (corpsId, year, division, name, position, score, title, rep ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
);


const rootUrl =
	"https://www.dcxmuseum.org/repertoire_display.cfm?ReturnAll=Y&RepYear=";

const startYear = 1973;
const currentDate = new Date();
const currentYear = currentDate.getFullYear() + 1;

try {
	for (let year = startYear; year < currentYear; year++) {
		console.log(`Requesting ${year}`);
		console.log(`${rootUrl}${year}`);
		const response = await fetch(`${rootUrl}${year}`);
		const body = await response.text();
		// console.log(body);

		const dom = new JSDOM(`<!DOCTYPE html>${body}`);
		console.log(dom.window.document.querySelector("h1").textContent); 

		const tableRows = dom.window.document.querySelectorAll(
			"table.table-bordered tr",
		);
		// console.log(tableRows);
		// console.log(tableRows.length);

		// console.log(tableRows[0].children.length);

		const skips = [
			"Corps",
			"Junior",
			"All Age",
			"Alumni",
			"Sound Sport",
			"Military",
			"Minicorps",
		];

		let division = "";

		for (const oneCorps of tableRows) {
			const corpsName = oneCorps.children[0].textContent.trim();
			console.log("Name: ", corpsName);
			// console.log(oneCorps.children[0].nodeName);
			const corpsLink = oneCorps.children[0].querySelector("a");
			// console.log(corpsLink);
			let corpsId = "";
			if (corpsLink) {
				const corpsUrl = corpsLink.getAttribute("href");
				const corpsIdArr = /corpsid=(\d+)&/.exec(corpsUrl);
				if (corpsIdArr) {
					corpsId = corpsIdArr[1];
				}
				// console.log(corpsId);
			}

			if (
				oneCorps.children[0].hasAttribute("colspan") ||
				skips.includes(corpsName)
			) {
				division = oneCorps.textContent;
				if (division) {
					division = division.trim();
				}
				console.log("New Division: ", division);
			} else {
				const position = oneCorps.children[1].textContent.trim();
				const score = oneCorps.children[2].textContent.trim();
				// const rep = oneCorps.children[3].textContent.trim();

				const rep = [];

				console.log(
					`Id [${corpsId}] Division [${division}] Corps [${corpsName}] Position [${position}] Score [${score}]`,
				);

				// Now try to process the repertoire
				// console.log(rep);
				let showTitle = "";
				const title = oneCorps.children[3].querySelector("font");
				if (title) {
					console.log(`TITLE: [${title.textContent.trim()}]`);
					showTitle = title.textContent.trim();
				} else {
					console.log("Show did not have a title");
				}

				const songs = oneCorps.children[3].querySelectorAll("a");
				if (songs.length) {
					console.log("Songs: ", songs.length);
					for (const oneSong of songs) {
						const name = oneSong.textContent.trim();
						console.log(`\tSong [${name}]`);
						rep.push(name);
					}
				}

				console.log(
					"About to insert: ",
					corpsId,
					year,
					division,
					corpsName,
					position,
					score,
					showTitle,
					rep.join("~!~"),
				);
				// key, year, division, name, position, score, title, rep

				dbInsertScores.run(
					corpsId,
					year,
					division,
					corpsName,
					Number.parseInt(position),
					Number.parseFloat(score),
					showTitle,
					rep.join("~!~"),
				);
			}
		}
	}
} catch (e) {
	console.error("Caught error:");
	console.error(e);
}
