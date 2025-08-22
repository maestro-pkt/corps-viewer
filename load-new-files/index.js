import sqlite3 from 'better-sqlite3';
import klaw from 'klaw';
//import { parseFile } from 'music-metadata';
import { parseFile } from '../server/music-metadata/lib/index.js';
import fs from 'node:fs';
import path from 'node:path';
import pressAnyKey from 'press-any-key';
import getDimensions from 'get-video-dimensions';

import ffmpeg from 'fluent-ffmpeg';
import ffprobePath from '@ffprobe-installer/ffprobe';

ffmpeg.setFfprobePath(ffprobePath.path);
console.log('Using ffprobe path:', ffprobePath.path);

// process.env.SQLITE3_DATABASE = 's:/corps-player/data/dci-2.db';
// process.env.DATA_PATH = 'S:/corps-player/data';

// //process.env.MEDIA_PATH = 'e:';
// process.env.MEDIA_PATH = 'S:/testData';

process.env.SQLITE3_DATABASE = '/mnt/s/corps-player/data/dci-2.db';
process.env.DATA_PATH = '/mnt/s/corps-player/data';

process.env.MEDIA_PATH = '/mnt/e';
//process.env.MEDIA_PATH = '/mnt/s/testData';

const corpsDirs = [process.env?.MEDIA_PATH];
const dbfile = process.env?.SQLITE3_DATABASE;
let fileCntr = 0;
let newFileCntr = 0;
let unknownCntr = 0;

const db = new sqlite3(dbfile);
const insertVideo = db.prepare(
  'INSERT INTO files (corpsId, year, path, title, duration, resolution, dateAdded, videoCodec, audioCodec, audioChannels, audioSamples ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)'
);

// Get listings of every corps name
const corpsNameMap = getCorpsNames();
const corpsNamesList = Array.from(corpsNameMap.keys());

// process.env.DEBUG = 'music-metadata:*';

if (!dbfile) process.exit(1);

// Walk through each directory that contains videos
for (const oneDir of corpsDirs) {
  console.log('starting next directory:', oneDir);

  await pressAnyKey();

  //
  // Get all of the files
  klaw(oneDir, { nodir: true })
    .on('error', (err, item) => {
      console.error('Error reading directory:', item.path, err);
    })
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
        } else if (file.path.indexOf('System Volume Information') !== -1) {
          console.log('Skipping System Volume Information', file.path);
          continue; // skip .DS_Store files
        }
        console.log(
          '================================================================='
        );
        console.log(file.path);

        // if (fs.existsSync(file.path)) {
        //   console.log('File exists.');
        // } else {
        //   console.log('File does not exist.');
        // }

        await processFile(file);
      }
    })

    .on('end', async () => {
      // Dont close the stream because there are more directories to do.
      console.log(
        `Processed ${oneDir} ; ${fileCntr} files; ${unknownCntr} unknowns; ${newFileCntr} new files`
      );
    });
}

console.log('Done processing all directories');

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

async function processFile(oneFile) {
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

      // biome-ignore lint/complexity/noForEach: <explanation>
      matchedNames.forEach((one) => {
        if (one.length > theName.length) {
          theName = one;
          theId = corpsNameMap.get(one);
        }
      });

      //console.log(corpsNameMap.get(matchedNames[0]));
    }
  } else {
    console.log('No match found: ', path.basename(oneFile.path));

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

    if (!videoExists(oneFile.path)) {
      let finalTime = 'Unk';
      let container = '';
      let info = '';
      let dimensions = undefined;
      let videoCodec = '';
      let audioCodec = '';
      let audioChannels = '';
      let audioSamples = '';
      try {
        console.log('Getting file metadata...');

        try {
          // dimensions = await getDimensions(oneFile.path);
          // console.log('Video dimensions:', dimensions);

          ffmpeg.ffprobe(oneFile.path, async function (err, metadata) {
            if (err) {
              console.error('Error getting metadata with ffprobe:', err);
              return;
            }
            console.log(
              '+++++++++++++++++++++++++++++++++++++++++++++++++++++'
            );
            console.log(oneFile.path);
            console.dir(metadata);

            //info = `${metadata.format.bit_rate}|${metadata.format.format_name}|${metadata.format.nb_streams}|${metadata.format.sampleRate}`;

            metadata.streams.forEach((stream) => {
              if (stream.codec_type === 'video') {
                console.log('Video stream found:');
                console.log(`Codec: ${stream.codec_name}`);
                console.log(`Width: ${stream.width}`);
                console.log(`Height: ${stream.height}`);
                //console.log(`Duration: ${stream.duration}`);
                dimensions = { width: stream.width, height: stream.height };
                videoCodec = stream.codec_name;
              } else if (stream.codec_type === 'audio') {
                console.log('Audio stream found:');
                console.log(`Codec: ${stream.codec_name}`);
                console.log(`Channels: ${stream.channels}`);
                console.log(`Sample Rate: ${stream.sample_rate}`);
                audioCodec = stream.codec_name;
                audioChannels = stream.channels;
                audioSamples = stream.sample_rate;
              }
            });
            console.log('Duration:', formatTime(metadata.format.duration));

            console.log(info);
            const x = insertVideo.run(
              theId,
              theYear,
              oneFile.path,
              fnParts.name, // title
              formatTime(metadata.format.duration),
              dimensions ? `${dimensions.width}x${dimensions.height}` : 'UNK',
              Math.floor(Date.now() / 1000),
              videoCodec || 'UNK',
              audioCodec || 'UNK',
              audioChannels || 'UNK',
              audioSamples || 'UNK'
            );
            console.log('Insert result:', x);
            newFileCntr++;
          });
        } catch (err) {
          console.error('Error parsing file:', oneFile.path, err);
        }

        // console.log('Metadata read!');

        // const metadata = {
        //   format: {
        //     container: 'mp4',
        //     bitrate: '1000',
        //     codec: 'h264',
        //     numberOfChannels: 2,
        //     sampleRate: 44100,
        //     duration: 3600,
        //   },
        // };
        // console.log(metadata);
        // container = metadata.format.container;
        // info = `${metadata.format.bitrate}|${metadata.format.codec}|${metadata.format.numberOfChannels}|${metadata.format.sampleRate}`;

        // let time = metadata.format.duration;
        // const minutes = Math.floor(time / 60);
        // const seconds = time - minutes * 60;
        // const hours = Math.floor(time / 3600);
        // time = time - hours * 3600;
        // // console.log(minutes);
        // if (!Number.isNaN(minutes)) {
        //   function str_pad_left(string, pad, length) {
        //     return (new Array(length + 1).join(pad) + string).slice(-length);
        //   }

        //   finalTime = `${str_pad_left(minutes, '0', 2)}:${str_pad_left(
        //     seconds,
        //     '0',
        //     2
        //   )}`;
        //   console.log(finalTime);
        // } else {
        //   console.log('time not a number');
        // }

        // if (container === undefined) {
        //   container = 'UNK';
        // }
      } catch (e) {
        console.log('Error reading metadata for file:', oneFile.path);

        console.error(e);
      }
      // console.log(container);

      // const x = insertVideo.run(
      //   theId,
      //   theYear,
      //   oneFile.path,
      //   fnParts.name,
      //   finalTime,
      //   container,
      //   info,
      //   Math.floor(Date.now() / 1000),
      //   dimensions ? `${dimensions.width}x${dimensions.height}` : 'UNK'
      // );
      // console.log('Insert result:', x);
      // newFileCntr++;
    } else {
      console.log('File already exists in the database:', oneFile.path);
    }
  }
  console.log(
    `Processed file: ${oneFile.path} ; ${fileCntr} files; ${unknownCntr} unknowns; ${newFileCntr} new files`
  );
}

function formatTime(time) {
  let finalTime = 'Unk';
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
  return finalTime;
}
