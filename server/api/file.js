export default defineEventHandler(async (event) => {
	const { req, res } = event.node;

	// Sample data to return (e.g., a large text file)
	const data = "This is a sample text file. ".repeat(1000); // A long string to simulate file content

	const totalLength = Buffer.byteLength(data);
	const range = req.headers.range;

	if (!range) {
		// If no range is specified, return the whole content
		res.writeHead(200, {
			"Content-Type": "text/plain",
			"Content-Length": totalLength,
		});
		res.end(data);
		return;
	}

	// Parse the range header
	const parts = range.replace(/bytes=/, "").split("-");
	const start = Number.parseInt(parts[0], 10);
	const end = parts[1] ? Number.parseInt(parts[1], 10) : totalLength - 1;

	if (start >= totalLength || end >= totalLength || start > end) {
		res.writeHead(416, {
			"Content-Range": `bytes */${totalLength}`,
		});
		res.end();
		return;
	}

	// Slice the data according to the range
	const chunk = data.slice(start, end + 1);
	res.writeHead(206, {
		"Content-Range": `bytes ${start}-${end}/${totalLength}`,
		"Accept-Ranges": "bytes",
		"Content-Length": Buffer.byteLength(chunk),
		"Content-Type": "text/plain",
	});
	res.end(chunk);
});
