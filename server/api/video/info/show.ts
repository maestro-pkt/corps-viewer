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
      'SELECT * FROM scores where year = ? and corpsId = ?'
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
        console.log('shows row:');
        console.log(rows[0]);
        resolve(rows[0]);
      }
    });
  });
});

// const vidId = event.context.params?.vidId;
// if (!vidId) return { error: 'Missing vidId parameter' };

// return new Promise((resolve, reject) => {
//   const sql = db.prepare('SELECT * FROM scores where key=?');

//   sql.all(vidId, (error, rows) => {
//     if (error) {
//       console.log('error:');
//       console.log(error);
//       reject(error);
//     } else {
//       console.log('show info rows:');
//       console.log(rows);
//       resolve(rows[0]);
//     }
//   });
// });
//});
