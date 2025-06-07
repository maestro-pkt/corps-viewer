import fs from 'node:fs';
// import sqlite3 from 'sqlite3';

import Database from 'better-sqlite3';
const options = {};
const db = new Database(process.env?.SQLITE3_DATABASE, options);
db.pragma('journal_mode = WAL');

export default defineEventHandler(async (event) => {
  console.log('----------------------------------------');
  const { req, res } = event.node;

  const vidId = event?.context?.params?.vidId;
  console.log('GetVideoId:', vidId);

  const sql = db.prepare('SELECT * FROM files where key=?');

  try {
    const rows = await sql.all(vidId);

    console.log('1rows:');
    console.log(rows);

    console.log('path:', rows[0]?.path);
    let modifiedPath = rows[0]?.path;
    if (process.env?.PATH_REWRITE_FROM) {
      console.log(
        '1rewriting path',
        process.env.PATH_REWRITE_FROM,
        process.env.PATH_REWRITE_TO
      );
      modifiedPath = process.env.PATH_REWRITE_TO + modifiedPath.slice(2);
      // modifiedPath = modifiedPath.replace(
      //   new RegExp(process.env.PATH_REWRITE_FROM),
      //   process.env.PATH_REWRITE_TO
      // );

      modifiedPath = modifiedPath.replace(/\\/g, '/'); // replace all backslashes with forward slashes
    }
    console.log('modifiedPath', modifiedPath);

    const range = req.headers.range;
    console.log('range: ', range);

    if (!range) {
      console.log('return whole thing');

      console.log('reading file:');

      const buffer = fs.readFileSync(modifiedPath);
      const data = Buffer.from(buffer);
      console.log('done');

      const totalLength = Buffer.byteLength(data);
      console.log('length: ', totalLength);

      // If no range is specified, return the whole content
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Content-Length': totalLength,
      });
      res.end(data);
      console.log('1');
      return;
    }

    // Getting information for a file
    const statsObj = fs.statSync(modifiedPath);

    // Parse the range header
    const parts = range.replace(/bytes=/, '').split('-');
    const start = Number.parseInt(parts[0], 10);
    let end = parts[1] ? Number.parseInt(parts[1], 10) : statsObj.size - 1;

    if (start >= statsObj.size || end >= statsObj.size || start > end) {
      console.log('return middle partial');
      if (end - start > 1000000000) {
        console.log('partial file too big, breaking up into smaller chunks');
        end = start + 100000000;
      }

      res.writeHead(416, {
        'Content-Range': `bytes */${statsObj.size}`,
      });
      res.end();
      console.log('2');
      return;
    }

    // check file size
    if (end - start > 1000000000) {
      console.log('file too big, breaking up into smaller chunks');
      end = start + 100000000;
    }

    console.log('return beginning chunk', start, end + 1);

    // Slice the data according to the range
    const chunk = await readFromOffset(modifiedPath, start, end + 1);
    //const chunk = data.slice(start, end + 1);
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${statsObj.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': Buffer.byteLength(chunk),
      'Content-Type': 'text/plain',
    });
    res.end(chunk);
    console.log('3');
    return;
  } catch (e) {
    console.log('error streaming file:', e.message);
    console.error(e);
  }
});

function readFromOffset(filePath: string, offset: number, length: number) {
  return new Promise((resolve, reject) => {
    fs.open(filePath, 'r', (err, fd) => {
      if (err) {
        console.error('Error opening file:', err);
        reject(err);
      }

      const buffer = Buffer.alloc(length);

      fs.read(fd, buffer, 0, length, offset, (err, bytesRead, buffer) => {
        fs.close(fd, (closeErr) => {
          if (closeErr) {
            console.error('Error closing file:', closeErr);
            reject(closeErr);
          }
        });
        if (err) {
          console.error('Error reading file:', err);
          reject(err);
        }

        console.log('Bytes read:', bytesRead);
        resolve(buffer);
      });
    });
  });
}
