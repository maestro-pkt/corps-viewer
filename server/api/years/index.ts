import sqlite3 from 'sqlite3';

export default defineEventHandler(() => {
  const dbfile = process.env?.SQLITE3_DATABASE;
  console.log('dbfile:', dbfile);
  if (!dbfile) return { error: '... error messages' };
  const db = new sqlite3.Database(dbfile);

  return new Promise((resolve, reject) => {
    db.all(
      'SELECT distinct year FROM scores order by year desc',
      (error, rows) => {
        if (error) {
          console.log('error:');
          console.log(error);
          reject(error);
        } else {
          console.log('rows:');
          console.log(rows);
          resolve(rows);
        }
      }
    );
  });
});
