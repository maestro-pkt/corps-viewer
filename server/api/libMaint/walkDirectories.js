import sqlite3 from 'better-sqlite3';
import klaw from 'klaw';
//import { parseFile } from 'music-metadata';
import { parseFile } from '../../music-metadata/lib/index.js';
import fs from 'node:fs';
import path from 'node:path';

const corpsDirs = [process.env?.MEDIA_PATH];
const dbfile = process.env?.SQLITE3_DATABASE;
let fileCntr = 0;
let newFileCntr = 0;
let unknownCntr = 0;

const db = new sqlite3(dbfile);

// Get listings of every corps name
const corpsNameMap = getCorpsNames();
const corpsNamesList = Array.from(corpsNameMap.keys());

// process.env.DEBUG = 'music-metadata:*';

export default defineEventHandler(async (event) => {
  const eventStream = createEventStream(event);

  if (!dbfile) return { error: '... error messages' };

  // const files = [
  //   //'/media/DrumCorpsVideos2/Blue Devils B 2025 Multi Cam at DCI Gold Showcase.mkv',
  //   //'/media/DrumCorpsVideos2/Raiders 1996 - Finals.mkv',
  //   '/mnt/e/DrumCorpsVideos2/2011 DCA SEMI FINALS THE HAWTHORNE CABALLEROS.mkv',
  //   '/mnt/e/DrumCorpsVideos2/2011 7th Regiment.mkv',
  //   '/mnt/e/DrumCorpsVideos2/2010 TEAL SOUND DRUM AND BUGLE CORPS.mkv',
  // ];

  // for (const f of files) {
  //   console.log(`Processing file: ${f}`);
  //   if (fs.existsSync(f)) {
  //     console.log('File exists.');
  //   } else {
  //     console.log('File does not exist.');
  //   }
  //   const metadata = await parseFile(f, { duration: true });

  //   console.log(metadata);
  // }

  // Walk through each directory that contains videos
  for (const oneDir of corpsDirs) {
    console.log('starting next directory:', oneDir);
    //
    // Get all of the files
    klaw(oneDir, { nodir: true })
      .on('readable', async function () {
        let file;

        // Walk through each file in the directory
        // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
        while ((file = this.read())) {
          // Format of structure
          // file = {path: '/some/dir/file1', stats: {}},
          //        S_IFREG    0100000   regular file
          const isRegFile =
            (file.stats.mode & fs.constants.S_IFMT) === fs.constants.S_IFREG;
          if (!isRegFile) {
            console.log('Skipping non-regular file:', file.path);
            continue; // skip non-regular files
          }

          await eventStream.push(
            '================================================================='
          );

          console.log(
            '================================================================='
          );
          console.log(file.path);

          await eventStream.push(`${file.path.replaceAll('\n', '~||~')}`);

          if (fs.existsSync(file.path)) {
            console.log('File exists.');
          } else {
            console.log('File does not exist.');
          }
          try {
            debugger;
            const metadata = await parseFile(file.path, { duration: true });
            console.log('Metadata read for file:', file.path);
            // console.log(metadata);
          } catch (e) {
            console.log('Error reading metadata for file:', file.path);
            console.error(e);
          }

          await processFile(file, eventStream);
        }
      })
      // .on("error", (err) => {
      // 	console.error("Error reading directory:", err);
      // 	eventStream.push(`Error reading directory: ${err.message}`);
      // 	// Close the event stream on error
      // 	eventStream.close();
      // })
      .on('end', async () => {
        await eventStream.push(
          `Processed ${oneDir} ; ${fileCntr} files; ${unknownCntr} unknowns; ${newFileCntr} new files`
        );

        // Dont close the stream because there are more directories to do.
        console.log(
          `Processed ${oneDir} ; ${fileCntr} files; ${unknownCntr} unknowns; ${newFileCntr} new files`
        );

        eventStream.close();
      });
  }

  console.log('Done processing all directories');

  return eventStream.send();
});

function getCorpsIds() {
  const query = db.prepare(
    'SELECT distinct corpsId, name FROM scores order by corpsId;'
  );
  // Execute the prepared statement and log the result set.
  return query.all();
}

function getCorpsAka() {
  const query2 = db.prepare(
    'SELECT distinct corpsId, name FROM aka order by corpsId;'
  );
  // Execute the prepared statement and log the result set.
  return query2.all();
}

function getCorpsNames() {
  const names = new Map();

  const results = getCorpsIds();

  for (const oneCorps of results) {
    if (oneCorps.name.length >= 4) {
      names.set(oneCorps.name, oneCorps.corpsId);
    } else {
      // console.log(`[${oneCorps.name}] is too short`);
    }
  }

  // Execute the prepared statement and log the result set.
  const results2 = getCorpsAka();
  for (const oneCorps of results2) {
    if (oneCorps.name.length >= 4) {
      names.set(oneCorps.name, oneCorps.corpsId);
    } else {
      // console.log(`[${oneCorps.name}] is too short`);
    }
  }

  return names;
}

function videoExists(fn) {
  const query2 = db.prepare('SELECT count(*) as cnt FROM files where path=?');
  // Execute the prepared statement and log the result set.
  const res = query2.all(fn);
  // console.log(res);
  // console.log(res[0].cnt);
  if (res[0].cnt === 1) {
    console.log('File already in DB');
    return true;
  }
  return false;
}

async function processFile(oneFile, eventStream) {
  fileCntr++;
  // Break up the filename into its parts
  const fnParts = path.parse(oneFile.path);
  // console.log(fnParts);

  // Try to find the year in the filename
  let theYear = '';
  let theName = '';
  let theId = -1;

  // Try to find and extract a year in the filename
  // 19xx regex
  const year1 = /(19\d\d)/;
  const match1 = year1.exec(fnParts.name);
  if (match1) {
    // console.log(`1 Found ${match1[1]}`);
    // await eventStream.push(`Year: ${match1[1]}`);
    theYear = match1[1];
  } else {
    // now look for 2000+
    const year2 = /(20\d\d)/;
    const match2 = year2.exec(fnParts.name);
    if (match2) {
      // console.log(`2 Found ${match2[1]}`);
      // await eventStream.push(`Year: ${match2[1]}`);
      theYear = match2[1];
    } else {
      // console.log("No year found");
      // await eventStream.push("Year: None found");
    }
  }

  // Try to find the corps name in the filename
  const matchedNames1 = corpsNamesList.filter((oneName) => {
    return fnParts.name.toLowerCase().indexOf(oneName.toLowerCase()) !== -1;
  });

  // also look for corps with underscores instead of spaces
  const matchedNames2 = corpsNamesList.filter((oneName) => {
    return (
      fnParts.name
        .toLowerCase()
        .indexOf(oneName.toLowerCase().replace(' ', '_')) !== -1
    );
  });
  // also look for corps with hyphens instead of spaces
  const matchedNames3 = corpsNamesList.filter((oneName) => {
    return (
      fnParts.name
        .toLowerCase()
        .indexOf(oneName.toLowerCase().replace(' ', '-')) !== -1
    );
  });
  // also look for corps with no spaces
  const matchedNames4 = corpsNamesList.filter((oneName) => {
    return (
      fnParts.name
        .toLowerCase()
        .indexOf(oneName.toLowerCase().replace(' ', '')) !== -1
    );
  });

  // =========================================================
  // Now combine them all together and unique the matched corps
  const matchedNames = Array.from(
    new Set([
      ...matchedNames1,
      ...matchedNames2,
      ...matchedNames3,
      ...matchedNames4,
    ])
  );
  // console.log(
  //	matchedNames,
  //matchedNames1,
  //		matchedNames2,
  //	matchedNames3,
  //		matchedNames4,
  //);

  if (matchedNames.length > 0) {
    console.log('A match was found:', matchedNames);
    await eventStream.push(`A match was found: ${matchedNames.join(', ')}`);

    if (matchedNames.length === 1) {
      theName = matchedNames[0];
      theId = corpsNameMap.get(matchedNames[0]);
      // console.log(corpsNameMap.get(matchedNames[0]));
      // await eventStream.push(`Name: ${corpsNameMap.get(matchedNames[0])}`);
    } else {
      // console.log(
      //   'Multiple name matches!  Using the longest one...',
      //   matchedNames
      // );
      await eventStream.push(
        `Multiple name matches! Using the longest one... ${matchedNames.join(
          ', '
        )}`
      );

      // biome-ignore lint/complexity/noForEach: <explanation>
      matchedNames.forEach((one) => {
        if (one.length > theName.length) {
          theName = one;
          theId = corpsNameMap.get(one);
        }
      });

      //console.log(corpsNameMap.get(matchedNames[0]));
      await eventStream.push(`Name: ${corpsNameMap.get(matchedNames[0])}`);
    }
  } else {
    console.log('No match found: ', path.basename(oneFile.path));
    await eventStream.push(
      'No corps name found in the file name; adding to unknowns'
    );
    unknownCntr++;
    const insertUnknown = db.prepare(
      'INSERT INTO unknowns (path, filename, dateAdded) VALUES (?, ?, ?)'
    );
    insertUnknown.run(
      oneFile.path,
      path.basename(oneFile.path),
      oneFile.stats.birthtimeMs
    );
  }

  // Do we have everything we need to insert the video?
  if (theYear.length === 4 && theId > 0 && theName.length > 0) {
    // console.log(fnParts.name);
    console.log(`Name: ${theName} ; Year: ${theYear}; Id: ${theId}`);
    await eventStream.push(`Name: ${theName} ; Year: ${theYear}; Id: ${theId}`);

    if (!videoExists(oneFile.path)) {
      let finalTime = 'Unk';
      let container = '';
      let info = '';
      try {
        console.log('Getting file metadata...');
        await eventStream.push('Getting file metadata...');
        debugger;
        const metadata = await parseFile(oneFile.path, {
          duration: true,
          skipCovers: true,
          // skipPostHeaders: true,
          // skipPostHeaders: true,
        });

        console.log('Metadata read!');
        await eventStream.push('Metadata read!');
        // const metadata = {
        // 	format: {
        // 		container: "mp4",
        // 		bitrate: "1000",
        // 		codec: "h264",
        // 		numberOfChannels: 2,
        // 		sampleRate: 44100,
        // 		duration: 3600,
        // 	}
        // };
        console.log(metadata);
        container = metadata.format.container;
        info = `${metadata.format.bitrate}|${metadata.format.codec}|${metadata.format.numberOfChannels}|${metadata.format.sampleRate}`;

        let time = metadata.format.duration;
        const minutes = Math.floor(time / 60);
        const seconds = time - minutes * 60;
        const hours = Math.floor(time / 3600);
        time = time - hours * 3600;
        // console.log(minutes);
        if (!Number.isNaN(minutes)) {
          function str_pad_left(string, pad, length) {
            return (new Array(length + 1).join(pad) + string).slice(-length);
          }

          finalTime = `${str_pad_left(minutes, '0', 2)}:${str_pad_left(
            seconds,
            '0',
            2
          )}`;
          console.log(finalTime);
        } else {
          console.log('time not a number');
        }

        if (container === undefined) {
          container = 'UNK';
        }
      } catch (e) {
        console.log('Error reading metadata for file:', oneFile.path);
        await eventStream.push(
          `Error reading metadata for file: ${oneFile.path}`
        );
        console.error(e);
      }
      // console.log(container);
      const insertVideo = db.prepare(
        'INSERT INTO files (corpsId, year, path, title, duration, filetype, fileinfo, dateAdded ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );
      const x = insertVideo.run(
        theId,
        theYear,
        oneFile.path,
        fnParts.name,
        finalTime,
        container,
        info,
        Math.floor(Date.now() / 1000)
      );
      console.log('Insert result:', x);
      newFileCntr++;
    } else {
      console.log('File already exists in the database:', oneFile.path);
      await eventStream.push(
        `File already exists in the database: ${oneFile.path}`
      );
    }
  }
  console.log(
    `Processed file: ${oneFile.path} ; ${fileCntr} files; ${unknownCntr} unknowns; ${newFileCntr} new files`
  );
}
