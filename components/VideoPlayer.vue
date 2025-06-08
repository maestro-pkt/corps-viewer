<script setup lang="js">
import videojs from "video.js";
import { usePrefsStore } from "@/stores/prefs.js";
import { storeToRefs } from "pinia";
let player = null;
const videoPlayer = ref(null);
const { volume, mute, skip10, skip30 } = storeToRefs(usePrefsStore());

const props = defineProps({
	options: {
		type: Object,
		default() {
			return {};
		},
	},
	vidId: {
		type: String,
		required: true,
		default() {
			return "";
		},
	},
	vidType: {
		type: String,
		required: true,
		default() {
			return "video/mp4";
		},
	},
	endpoint: {
		type: String,
		required: false,
		default() {
			return "/api/video/stream";
		},
	},
});

onMounted(() => {
	console.log("video id", props.vidId);
	console.log("vidType:", props.vidType);
	// props.options.sources.push({
	// 	src: "https://vjs.zencdn.net/v/oceans.mp4",
	// 	type: "video/mp4",
	// });
	if (props.vidId !== null && props.vidId !== "" && props.vidId !== undefined) {
		props.options.sources.push({
			src: `${props.endpoint}/${props.vidId}`,
			type: props.vidType,
		});
	}

	player = videojs(videoPlayer.value, props.options, () => {
		player.log("onPlayerReady", this);
	});

	// Buffer Percentage of the video with progress event listener
	// player.on("progress", () => {
	// console.log(player.remainingTime(), player.volume());
	// 	const buffPercentage = player.bufferedPercent();
	// 	console.log("Buffer Percentage: ", buffPercentage);
	// });

	player.volume(Number.parseInt(volume.value) / 100);

	player.on("volumechange", () => {
		volume.value = Math.floor(player.volume() * 100).toString();
		// console.log("Volume changed to:", player.volume());
		// console.log(volume.value);
	});
});

watch(
	() => mute.value,
	(newValue) => {
		if (newValue) {
			console.log("mute");
			player.muted(true);
		} else {
			console.log("unmute");
			player.muted(false);
		}
	},
);

watch(
	() => volume.value,
	(newValue) => {
		player.volume(Number.parseInt(newValue) / 100);
	},
);

watch(
	() => props.vidId,
	(newSource, oldSource) => {
		try {
			console.log("VideoPlayer.vue detected new vidId", newSource);
			console.log(oldSource);
			console.log(player);

			player.pause();
			player.src({
				src: `${props.endpoint}/${newSource}`,
				type: props.vidType,
			});

			player.log("Video ID found", this);

			player.load();
			player.play();

			// const videoDuration = player.duration();
			// console.log("(For FORM) Video duration:", videoDuration);

			// console.log(player.videoWidth(), player.videoHeight());

			// // Get the current resolution object
			// const currentResolution = player.currentResolution();
			// console.log("(For FORM) Video resolution:", currentResolution);

			// // Get the currently active quality level
			// const currentQualityLevel = player.qualityLevels();
			// console.log(currentQualityLevel);
			// // Access resolution information
			// for (const quality of currentQualityLevel) {
			// 	if (quality.enabled) {
			// 		console.log(quality.width, quality.height);
			// 		// Current resolution
			// 	}
			// }
		} catch (e) {
			console.error("Error in VideoPlayer.vue", e);
		}
	},
);

watch(
	() => skip10,
	(newValue) => {
		skip(10);
	},
);

watch(
	() => skip30,
	(newValue) => {
		skip(30);
	},
);

function forward() {
	skip(10);
}

function backward() {
	skip(-10);
}

function skip(time) {
	console.log("Skipping video by", time, "seconds");
	player.currentTime = player.currentTime + time;
}

document.addEventListener("keydown", (e) => {
	if (e.keyCode === 37) {
		//left arrow
		backward();
	} else if (e.keyCode === 39) {
		//right arrow
		forward();
	}
});

onUnmounted(() => {
	if (player) {
		player.dispose();
	}
});
</script>

<template>
  <div>
    <video ref="videoPlayer" class="video-js"></video>
  </div>
</template>
