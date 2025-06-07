import sqlite3 from 'sqlite3';

export default defineEventHandler((event) => {
  const dbfile = process.env?.SQLITE3_DATABASE;
  if (!dbfile) return { error: '... error messages' };
  const db = new sqlite3.Database(dbfile);

  const fileId = decodeURI(event?.context?.params?.fileId || '');

  console.log(fileId);

  return new Promise((resolve, reject) => {
    const sql = db.prepare('SELECT * FROM file_attributes where fileKey = ?');

    sql.all(fileId, (error, rows) => {
      if (error) {
        console.log('error:');
        console.log(error);
        reject(error);
      } else {
        console.log('file attribute rows:');
        console.log(rows);
        resolve(rows);
      }
    });
  });
});
