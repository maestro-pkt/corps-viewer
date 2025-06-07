import sqlite3 from 'sqlite3';

export default defineEventHandler((event) => {
  const dbfile = process.env?.SQLITE3_DATABASE;
  if (!dbfile) return { error: '... error messages' };
  const db = new sqlite3.Database(dbfile);

  const query = getQuery(event);
  console.log(query);

  const year = query.year;
  const corpsId = query.corpsId;

  return new Promise((resolve, reject) => {
    const sql = db.prepare(
      'SELECT * FROM files where year = ? and corpsId = ?'
    );
    console.log(year);
    console.log(corpsId);
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    sql.all(year, corpsId, (error: Error | null, rows: any[]) => {
      if (error) {
        console.log('error:');
        console.log(error);
        reject(error);
      } else {
        console.log('shows rows:');
        console.log(rows);
        resolve(rows);
      }
    });
  });
});
