import sqlite3 from 'sqlite3';
// import { addTag } from '../../../../drumcorps-scripts-2024/db.common.js';
export default defineEventHandler(async (event) => {
  const dbfile = process.env?.SQLITE3_DATABASE;
  if (!dbfile) return { error: '... error messages' };
  const db = new sqlite3.Database(dbfile);

  const body = await readBody(event);
  console.log('post tag:', body);
  const fileId = decodeURI(event?.context?.params?.fileId || '');

  console.log(fileId);

  return new Promise((resolve, reject) => {
    console.log(fileId, body);

    let sqlText = 'INSERT INTO file_attributes (fileKey,';
    let updateText = '';
    let fieldCnt = 1;
    const values1 = [];

    values1.push(fileId);

    // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
    if (body.hasOwnProperty('tags')) {
      sqlText += 'tag, ';
      updateText += 'tag=?, ';
      fieldCnt++;
      values1.push(body.tags.join(','));
    }
    // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
    if (body.hasOwnProperty('rating')) {
      sqlText += 'rating, ';
      updateText += 'rating=?, ';
      fieldCnt++;
      values1.push(body.rating);
    }
    // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
    if (body.hasOwnProperty('highCam')) {
      sqlText += 'highCam, ';
      updateText += 'highCam=?, ';
      fieldCnt++;
      values1.push(body.highCam);
    }
    // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
    if (body.hasOwnProperty('percussionCam')) {
      sqlText += 'percussionCam, ';
      updateText += 'percussionCam=?, ';
      fieldCnt++;
      values1.push(body.percussionCam);
    }
    // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
    if (body.hasOwnProperty('guardCam')) {
      sqlText += 'guardCam, ';
      updateText += 'guardCam=?, ';
      fieldCnt++;
      values1.push(body.guardCam);
    }

    // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
    if (body.hasOwnProperty('officialVideo')) {
      sqlText += 'officialVideo, ';
      updateText += 'officialVideo=?, ';
      fieldCnt++;
      values1.push(body.officialVideo);
    }

    // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
    if (body.hasOwnProperty('finalsVideo')) {
      sqlText += 'finalsVideo, ';
      updateText += 'finalsVideo=?, ';
      fieldCnt++;
      values1.push(body.finalsVideo);
    }

    // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
    if (body.hasOwnProperty('unofficialVideo')) {
      sqlText += 'unofficialVideo, ';
      updateText += 'unofficialVideo=?, ';
      fieldCnt++;
      values1.push(body.unofficialVideo);
    }

    // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
    if (body.hasOwnProperty('viewCntr')) {
      sqlText += 'viewCntr, ';
      updateText += 'viewCntr=?, ';
      fieldCnt++;
      values1.push(body.viewCntr);
    }

    sqlText = sqlText.slice(0, -2);
    sqlText += ') VALUES (';
    for (let i = 0; i < fieldCnt; i++) {
      sqlText += '?, ';
    }
    sqlText = sqlText.slice(0, -2);
    sqlText += ') ON CONFLICT (fileKey) DO UPDATE SET fileKey=?, ';
    sqlText += updateText;
    sqlText = sqlText.slice(0, -2);

    console.log(sqlText);

    const sql = db.prepare(sqlText);
    const values = [...values1, ...values1];
    console.log(values);
    sql.run(values, (error: Error | null) => {
      console.log('error:', error);
    });
    // const sql = db.prepare(
    //   `INSERT INTO file_attributes (fileKey, tag)
    //   VALUES (?, ?)
    //   ON CONFLICT (fileKey)
    //   DO UPDATE SET fileKey=?, tag=?`
    // );

    // sql.run(
    //   fileId,
    //   body.tags.join(','),
    //   fileId,
    //   body.tags.join(','),
    //   (error: Error | null) => {
    //     console.log('error:', error);
    //   }
    // );
    resolve({ status: 'ok' });
  });
});
