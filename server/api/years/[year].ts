import sqlite3 from 'sqlite3';

export default defineEventHandler((event) => {
  const dbfile = process.env?.SQLITE3_DATABASE;
  if (!dbfile) return { error: '... error messages' };
  const db = new sqlite3.Database(dbfile);

  const year = event.context.params.year;

  return new Promise((resolve, reject) => {
    const sql = db.prepare(
      'SELECT distinct name, division, position, score, title, rep, year, corpsId FROM scores where year = ? order by division, position asc'
    );

    sql.all(year, (error, rows) => {
      if (error) {
        console.log('error:');
        console.log(error);
        reject(error);
      } else {
        console.log('specific year rows:');
        console.log(rows);
        resolve(rows);
      }
    });
  });
});
