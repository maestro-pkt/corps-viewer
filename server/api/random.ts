import sqlite3 from 'sqlite3';

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default defineEventHandler(() => {
  const dbfile = process.env?.SQLITE3_DATABASE;
  if (!dbfile) return { error: '... error messages' };
  const db = new sqlite3.Database(dbfile);

  return new Promise((resolve, reject) => {
    // get min/max from db
    db.all(
      'SELECT min(key), max(key) FROM files',
      (error, minMax: { 'min(key)': number; 'max(key)': number }[]) => {
        if (error) {
          console.log('error:');
          console.log(error);
          return { error: '... error messages' };
        }

        const min = minMax[0]['min(key)'] as number;
        const max = minMax[0]['max(key)'] as number;
        const rands: number[] = [];
        for (let i = 0; i < 10; i++) {
          rands.push(getRandomNumber(min, max));
        }

        db.all('SELECT * FROM files', (error, rows: { key: number }[]) => {
          if (error) {
            console.log('error:');
            console.log(error);
            reject(error);
          } else {
            const rtnRows = [];

            for (let i = 0; i < rands.length; i++) {
              const row = rows.find((r) => r.key === rands[i]);
              if (row) {
                rtnRows.push(row);
              }
            }

            // console.log('rows:');
            // console.log(rows);
            resolve(rtnRows);
          }
        });
      }
    );
  });
});
