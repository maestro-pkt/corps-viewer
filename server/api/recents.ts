import sqlite3 from 'sqlite3';

export default defineEventHandler(() => {
  const dbfile = process.env?.SQLITE3_DATABASE;
  if (!dbfile) return { error: '... error messages' };
  const db = new sqlite3.Database(dbfile);

  return new Promise((resolve, reject) => {
    db.all(
      'select * from files order by dateAdded desc limit 50',
      (error, rows) => {
        if (error) {
          console.log('error:');
          console.log(error);
          reject(error);
        } else {
          // console.log('rows:');
          // console.log(rows);
          resolve(rows);
        }
      }
    );
  });
});
