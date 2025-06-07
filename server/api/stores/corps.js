import { readJsonSync } from "fs-extra/esm";
import { join } from "node:path";

const dataPath = process.env?.DATA_PATH;
console.log("dataPath", dataPath);
export default defineEventHandler(() => {
	const corpsData = readJsonSync(join(dataPath, "byCorps.json"));

	return corpsData;
});
