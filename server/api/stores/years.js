import { readJsonSync } from 'fs-extra/esm';
import { join } from 'node:path';

const dataPath = process.env?.DATA_PATH; 
export default defineEventHandler(() => {
//const corpsData = readJsonSync('/db/byCorps.json');
    const yearsData = readJsonSync(join( dataPath, 'byYears.json'));  
  return yearsData;
    
});
