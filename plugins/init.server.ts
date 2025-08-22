import sqlite3 from 'better-sqlite3';
import fs from 'node:fs';

export default defineNitroPlugin((nitroApp) => {
  console.log('Server plugin initialized!');

  const dbfile = process.env?.SQLITE3_DATABASE;

  if (!dbfile) {
    console.error('SQLITE3_DATABASE environment variable is not set.');
    process.exit(1);
  }

  if (fs.existsSync(dbfile)) {
    console.log('Database File exists; skipping creation.');
  } else {
    console.log('Database does not exist; creating new database file:', dbfile);

    const db = new sqlite3(dbfile);

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

    db.exec(`
  CREATE TABLE  IF NOT EXISTS aka(
    key INTEGER PRIMARY KEY AUTOINCREMENT,
    corpsId INTEGER,
    name TEXT,
    UNIQUE(corpsId, name) ON CONFLICT IGNORE
  ) STRICT
`);

    db.exec(`
  CREATE TABLE  IF NOT EXISTS files(
    key INTEGER PRIMARY KEY AUTOINCREMENT,
    corpsId INTEGER,
    year INTEGER,
    path TEXT,
    title TEXT,
    duration TEXT,
    resolution TEXT,
    videoCodec TEXT,
    audioCodec TEXT,
    audioChannels TEXT,
    audioSampleRate TEXT,    
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

    db.exec(`
  CREATE TABLE IF NOT EXISTS ignoreFiles (
    key INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT,		
    UNIQUE(path) ON CONFLICT IGNORE
  ) STRICT
`);
  }
});
