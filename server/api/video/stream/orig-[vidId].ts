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

  const vidId = event?.context?.params?.vidId;
  console.log('GetVideoId:', vidId);

  const sql = db.prepare('SELECT * FROM files where key=?');

  try {
    const rows = await sql.all(vidId);

    console.log('1rows:');
    console.log(rows);

    console.log('path:', rows[0]?.path);
    const modifiedPath = rows[0]?.path.replace('/mnt/e', 'e:');
    console.log('modifiedPath', modifiedPath);

    console.log(
      '************** introduce an fs stat and then open the file and read partials later'
    );

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
    let end = parts[1] ? Number.parseInt(parts[1], 10) : totalLength - 1;

    if (start >= totalLength || end >= totalLength || start > end) {
      console.log('return middle partial');
      if (end - start > 1000000000) {
        console.log('partial file too big, breaking up into smaller chunks');
        end = start + 100000000;
      }

      res.writeHead(416, {
        'Content-Range': `bytes */${totalLength}`,
      });
      res.end();
      return;
    }

    if (end - start > 1000000000) {
      console.log('file too big, breaking up into smaller chunks');
      end = start + 100000000;
    }

    console.log('return beginning chunk', start, end + 1);
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
    console.log('error streaming file:', e.message);
    console.error(e);
  }
});

// async function getFileSize(filePath) {
//   try {
//     const stats = await fs.stat(filePath);
//     return stats.size;
//   } catch (err) {
//     console.error(err);
//   }
// }
