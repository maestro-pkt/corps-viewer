import { spawn } from "node:child_process";

// let cntr = 0;

// export default defineEventHandler(async (event) => {
// 	const eventStream = createEventStream(event);

// 	// Send a message every second
// 	const interval = setInterval(async () => {
// 		cntr++;
// 		await eventStream.push(
// 			"Hello world2\nnext line\nlast line".replaceAll("\n", "||"),
// 		);
// 		if (cntr === 5) {
// 			await eventStream.push("Bye");
// 			await eventStream.push("Stream ended");

// 			eventStream.close();
// 			clearInterval(interval);
// 		}
// 	}, 1000);

// 	// Cleanup the interval when the connection is terminated or the writer is closed
// 	eventStream.onClosed(() => {
// 		clearInterval(interval);
// 	});

// 	return eventStream.send();
// });

export default defineEventHandler(async (event) => {
	const eventStream = createEventStream(event);
	const command = "ls -al";
	const childProcess = spawn(command, [], { shell: true });
	const stderrData = "";

	childProcess.stdout.on("data", async (data) => {
		await eventStream.push(
			`stdout: ${data.toString().replaceAll("\n", "~||~")}`,
		);

		console.log(`stdout: ${data.toString()}`); // Stream stdout
	});

	childProcess.stderr.on("data", async (data) => {
		await eventStream.push(
			`stderr: ${data.toString().replaceAll("\n", "~||~")}`,
		);
		console.error(`stderr: ${data.toString()}`); // Stream stderr
	});

	childProcess.on("close", async (code) => {
		if (code === 0) {
			await eventStream.push("Command executed successfully");
			await eventStream.push("Stream ended");
			eventStream.close();
		} else {
			eventStream.close();
			new Error(`Command failed with code ${code}: ${stderrData}`);
		}
	});

	childProcess.on("error", async (err) => {
		console.log("error: ", err);
		await eventStream.push(`err: ${err}`);
		eventStream.close();
	});

	return eventStream.send();
});
