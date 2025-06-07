import sqlite3 from 'sqlite3';

export default defineEventHandler((event) => {
  const dbfile = process.env?.SQLITE3_DATABASE;
  if (!dbfile) return { error: '... error messages' };
  const db = new sqlite3.Database(dbfile);

  const corpsId = event.context.params
    ? decodeURI(event.context.params.corpsId)
    : '';

  console.log(corpsId);

  return new Promise((resolve, reject) => {
    const sql = db.prepare(
      'SELECT distinct year, division, position, corpsId, score, title, rep FROM scores where corpsId = ? order by year asc'
    );

    sql.all(corpsId, (error, rows) => {
      if (error) {
        console.log('error:');
        console.log(error);
        reject(error);
      } else {
        console.log('/corpsId rows:');
        console.log(rows);
        resolve(rows);
      }
    });
  });
});
