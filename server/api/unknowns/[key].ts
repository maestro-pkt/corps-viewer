import fs from 'node:fs';
// import sqlite3 from 'sqlite3';

import Database from 'better-sqlite3';
const options = {};
const db = new Database(process.env?.SQLITE3_DATABASE, options);
db.pragma('journal_mode = WAL');

export default defineEventHandler(async (event) => {
  console.log('----------------------------------------');
  const { req, res } = event.node;

  // const dbfile = process.env?.SQLITE3_DATABASE;
  // if (!dbfile) return { error: '... error messages' };
  // const db = new sqlite3.Database(dbfile);

  const vidId = event?.context?.params?.key;
  console.log('Unknown ID:', vidId);

  const sql = db.prepare('SELECT * FROM unknowns where key=?');

  try {
    const rows = await sql.all(vidId);

    // console.log('1rows:');
    // console.log(rows);

    console.log('path:', rows[0]?.path);
    //const modifiedPath = rows[0]?.path.replace('/mnt/e', 'e:');
    let modifiedPath = rows[0]?.path;
    if (process.env?.PATH_REWRITE_FROM) {
      console.log(
        '2rewriting path',
        process.env.PATH_REWRITE_FROM,
        process.env.PATH_REWRITE_TO
      );
      modifiedPath = modifiedPath.replace(
        process.env.PATH_REWRITE_FROM,
        process.env.PATH_REWRITE_TO
      );
      modifiedPath = modifiedPath.replace(/\\/g, '/'); // replace all backslashes with forward slashes
    }

    console.log('modifiedPath', modifiedPath);
    console.log('reading file:');
    const buffer = fs.readFileSync(modifiedPath);
    const data = Buffer.from(buffer);
    console.log('done');

    const totalLength = Buffer.byteLength(data);
    console.log('length: ', totalLength);

    const range = req.headers.range;
    console.log('range: ', range);

    if (!range) {
      console.log('return whole thing');

      // If no range is specified, return the whole content
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Content-Length': totalLength,
      });
      res.end(data);
      return;
    }

    // Parse the range header
    const parts = range.replace(/bytes=/, '').split('-');
    const start = Number.parseInt(parts[0], 10);
    const end = parts[1] ? Number.parseInt(parts[1], 10) : totalLength - 1;

    if (start >= totalLength || end >= totalLength || start > end) {
      console.log('return middle partial');
      res.writeHead(416, {
        'Content-Range': `bytes */${totalLength}`,
      });
      res.end();
      return;
    }

    console.log('return beginning chunk');
    // Slice the data according to the range
    const chunk = data.slice(start, end + 1);
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${totalLength}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': Buffer.byteLength(chunk),
      'Content-Type': 'text/plain',
    });
    res.end(chunk);
  } catch (e) {
    console.log('error');
    console.error(e);
  }

  //   return new Promise((resolve, reject) => {

  // const { req, res } = event.node;

  //     const sql = db.prepare('SELECT * FROM files where key=?');

  //     // biome-ignore lint/complexity/noBannedTypes: <explanation>
  //     sql.all(vidId, (error, rows) => {
  //       if (error) {
  //         console.log('error:');
  //         console.log(error);
  //         reject(error);
  //       } else {
  //         console.log('rows:');
  //         console.log(rows);

  //         console.log(rows[0]?.path);
  //         const modifiedPath = rows[0]?.path.replace('/mnt/e', 'e:');
  //         // must return
  //         // 206 Partial Content
  //         //setResponseStatus(event, 206);

  //         /*
  // Your server must properly support byte-range requests as Chrome and Safari rely on them:
  // Most servers support this by default.
  // If you are proxying the media files via a server side script (PHP), this script must implement ranges. PHP does not do this by default.
  // The impact of not doing this ranges from seeking being broken to no playback at all (on iOS).
  // Your server must return the correct mime-type/content-type header for the media being sent.

  // 	application/mp4
  // 	image/webp
  // 	video/matroska

  // Your server must implement CORS (cross-origin resource) headers if:
  // You are using formats like HLS or MPEG-DASH and your media is served from a different domain than your page.
  // You are using text tracks (captions, subtitles, etc.) and they are being served from a different domain than your page.
  // */

  //         resolve(sendStream(event, fs.createReadStream(modifiedPath)));
  //       }
  //     });
  //   });
});

// async function getFileSize(filePath) {
//   try {
//     const stats = await fs.stat(filePath);
//     return stats.size;
//   } catch (err) {
//     console.error(err);
//   }
// }
