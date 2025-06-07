import sqlite3 from "better-sqlite3";

const db = sqlite3("../data/dci-2.db");

db.exec(`
  CREATE TABLE  IF NOT EXISTS scores(
    key INTEGER PRIMARY KEY AUTOINCREMENT,
    corpsId INTEGER,
    year INTEGER,
    division TEXT,
    name TEXT,
    position INTEGER,
    score REAL,
    title TEXT,
    rep TEXT,
    UNIQUE(corpsId, year) ON CONFLICT REPLACE
  ) STRICT
`);

export const dbInsertScores = db.prepare(
	"INSERT INTO scores (corpsId, year, division, name, position, score, title, rep ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
);

db.exec(`
  CREATE TABLE IF NOT EXISTS logos (
  key INTEGER PRIMARY KEY AUTOINCREMENT,
  corpsId INTEGER,
  file TEXT,
  UNIQUE(corpsId) ON CONFLICT IGNORE
) STRICT
`);

export const dbRemoveCorps = db.prepare("delete from scores where corpsId=?");

db.exec(`
  CREATE TABLE  IF NOT EXISTS aka(
    key INTEGER PRIMARY KEY AUTOINCREMENT,
    corpsId INTEGER,
    name TEXT,
    UNIQUE(corpsId, name) ON CONFLICT IGNORE
  ) STRICT
`);

export const dbInsertAka = db.prepare(
	"INSERT INTO aka (corpsId, name ) VALUES (?, ?)",
);
db.exec(`
  CREATE TABLE  IF NOT EXISTS history(
    key INTEGER PRIMARY KEY AUTOINCREMENT,
    corpsId INTEGER,
    history TEXT,
    UNIQUE(corpsId) ON CONFLICT IGNORE
  ) STRICT
`);

export const dbInsertHistory = db.prepare(
	"INSERT INTO history (corpsId, history ) VALUES (?, ?)",
);

export const getAllScores = () => {
	const query = db.prepare(
		"SELECT distinct corpsId, name FROM scores order by corpsId;",
	);

	return query.all();
};

export const getCorpsIds = () => {
	console.log("1");
	const query = db.prepare(
		"SELECT distinct corpsId, name FROM scores order by corpsId;",
	);
	console.log("2");
	// Execute the prepared statement and log the result set.
	return query.all();
};

export const getCorpsAka = () => {
	// const query2 = db.prepare(
	// 	"SELECT distinct corpsId, name FROM aka order by corpsId;",
	// );
	// // Execute the prepared statement and log the result set.
	// return query2.all();
};

export const getCorpsPlacement = (corpsId, year) => {
	const query = db.prepare(
		"SELECT position  FROM scores where corpsId=? and year=? LIMIT 1",
	);
	// Execute the prepared statement and log the result set.
	const results = query.all(corpsId, year);
	if (results.length === 1) {
		return results[0].position;
	}

	return "Unk";
};

db.exec(`
  CREATE TABLE  IF NOT EXISTS files(
    key INTEGER PRIMARY KEY AUTOINCREMENT,
    corpsId INTEGER,
    year INTEGER,
    path TEXT,
    title TEXT,
    duration TEXT,
    resolution TEXT,
    filetype TEXT,
    fileinfo TEXT,
    dateAdded TEXT,
    UNIQUE(path) ON CONFLICT REPLACE
  ) STRICT
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS file_attributes (
    tag TEXT,
    rating INTEGER,
    highCam INTEGER,
    percussionCam INTEGER,
    guardCam INTEGER,
    fileKey INTEGER,
    officialVideo INTEGER,
		finalsVideo INTEGER,
		unofficialVideo INTEGER,
		viewCntr INTEGER,
    UNIQUE(fileKey) ON CONFLICT REPLACE
  ) STRICT
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS unknowns(
    key INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT,
		filename TEXT,
    dateAdded TEXT,
    UNIQUE(path) ON CONFLICT IGNORE
  ) STRICT
`);

export const insertVideo = db.prepare(
	"INSERT INTO files (corpsId, year, path, title, duration, filetype, fileinfo, dateAdded ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
);

export const insertUnknown = db.prepare(
	"INSERT INTO unknowns (path, filename, dateAdded) VALUES (?, ?, ?)",
);

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

export const videoExists = (fn) => {
	const query2 = db.prepare("SELECT count(*) as cnt FROM files where path=?");
	// Execute the prepared statement and log the result set.
	const res = query2.all(fn);
	// console.log(res);
	// console.log(res[0].cnt);
	if (res[0].cnt === 1) {
		console.log("File exists");
		return true;
	}
	return false;
};

export const queryFilename = (name) => {
	const query2 = db.prepare("SELECT * FROM files where title LIKE ?");
	// Execute the prepared statement and log the result set.
	return query2.all(name);
};
