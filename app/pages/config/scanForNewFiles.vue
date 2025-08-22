<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const streamedText = ref("");
const lineArray = [];
let eventSource = null;

const numNew = ref(0);
const numExisting = ref(0);
const numExistingUnknowns = ref(0);
const numNewUnknowns = ref(0);
const numTotalScanned = ref(0);

onMounted(() => {
	eventSource = new EventSource("/api/libMaint/walkDirectories");

	console.log(eventSource);

	eventSource.onmessage = (event) => {
		if (event.data === "Stream ended") {
			streamedText.value += "Stream ended\n";
			//eventSource.close();
			return;
		}
		// streamedText.value += `${event.data.length}\n`;



		lineArray.push(event.data);
		// streamedText.value += `${event.data}\n`;

		if (lineArray.length > 30) {
			lineArray.splice(0, 1);
		}

		streamedText.value = lineArray.join("\n").replaceAll("~||~", "\n");
	};

	eventSource.onerror = async (error) => {
		console.error("EventSource error:", error);
		eventSource.close();
		await $fetch("/api/libMaint/buildStores");
	};

	eventSource.onclose = async () => {
		console.log("EventSource closed");
		streamedText.value += "Stream ended!!!!!!!!!!!!!\n";

		await $fetch("/api/libMaint/buildStores");

	};
});

onUnmounted(() => {
	if (eventSource) {
		eventSource.close();
	}
});



</script>

<template>
	<div>

		<Panel header="Scanning for new files...">
			<table>
				<tbody>
					<tr>
						<td># New {{ numNew }}</td>
						<td># Existing {{ numExisting }}</td>
						<td># Existing Unknowns {{ numExistingUnknowns }}</td>
						<td># New Unknowns {{ numNewUnknowns }}</td>
						<td>Total Scanned {{ numTotalScanned }}</td>
					</tr>
				</tbody>
			</table>
			<div class="bg-black p-6 rounded-lg shadow-lg max-w-full  ">
				<pre class="font-mono text-gray-300 text-sm">
    <code>
{{ streamedText }}
    </code>
  </pre>
			</div>
		</Panel>
	</div>
</template>
