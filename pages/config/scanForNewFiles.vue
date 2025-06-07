<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const streamedText = ref("");
const lineArray = [];
let eventSource = null;

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

	eventSource.onerror = (error) => {
		console.error("EventSource error:", error);
		eventSource.close();
	};

	eventSource.onclose = () => {
		console.log("EventSource closed");
		streamedText.value += "Stream ended!!!!!!!!!!!!!\n";
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
