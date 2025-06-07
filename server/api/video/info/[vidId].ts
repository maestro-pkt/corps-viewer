import sqlite3 from 'sqlite3';

export default defineEventHandler((event) => {
  const dbfile = process.env?.SQLITE3_DATABASE;
  if (!dbfile) return { error: '... error messages' };
  const db = new sqlite3.Database(dbfile);

  const vidId = event.context.params.vidId;

  return new Promise((resolve, reject) => {
    const sql = db.prepare('SELECT * FROM files where key=?');

    sql.all(vidId, (error, rows) => {
      if (error) {
        console.log('error:');
        console.log(error);
        reject(error);
      } else {
        console.log('video info rows:');
        console.log(rows);
        resolve(rows[0]);
      }
    });
  });
});
