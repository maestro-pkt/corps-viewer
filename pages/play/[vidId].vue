<script setup lang="js">
import VideoPlayer from "@/components/VideoPlayer.vue";
import "video.js/dist/video-js.css";
import {
	BiZoomIn,
	BiZoomOut,
	FaVolumeMute,
	FaVolumeUp,
	FaVolumeDown,
} from "oh-vue-icons/icons";
import { OhVueIcon, addIcons } from "oh-vue-icons";
import { ref } from "vue";
import { usePrefsStore } from "@/stores/prefs.js";

addIcons(BiZoomIn, BiZoomOut, FaVolumeMute, FaVolumeUp, FaVolumeDown);
// import mkvExtract from "~/services/mkvExtract";

import { useCorpsStore } from "@/stores/corps.js";
import { useCrumbStore } from "@/stores/breadcrumb.js";
import { storeToRefs } from "pinia";

const route = useRoute();
const { year, name, position, score, title, rep, corpsId } = storeToRefs(
	useCorpsStore(),
);
const prefsStore = usePrefsStore();
const { volume } = storeToRefs(prefsStore);
const { history } = storeToRefs(useCrumbStore());

console.log("rep:", rep.value);
let repArray = []; //rep.value?.split("~!~");
if (rep.value && rep.value !== null && typeof rep.value === "string") {
	console.log(typeof rep.value);
	repArray = rep.value.split("~!~");
} else {
	repArray.push("Something wrong with rep");
}

const videoOptions = {
	autoplay: true,
	controls: true,
	fluid: true,
	//fill: true,
	inactivityTimeout: 0, // 0 indicates that the user will never be considered inactive.
	enableSmoothSeeking: true,
	sources: [],
};

const vidType = ref();
const tags = ref([]);
const rating = ref(0);
const viewCntr = ref(0);

const suffixes = ["th", "st", "nd", "rd"];

function getOrdinalSuffix(number) {
	// console.log("getOrdinalSuffix", number, Number.isNaN(number));
	if (number !== null && !Number.isNaN(number)) {
		// Get ones digit of number
		const onesDigit = number % 10;

		// Handle special cases for 11, 12, 13
		if (number % 100 >= 11 && number % 100 <= 13) {
			return "th";
		}

		// Pick suffix from array based on ones digit
		return onesDigit < 4 ? suffixes[onesDigit] : suffixes[0];
	}
	return "";
}

onMounted(async () => {
	const vidDetails = await $fetch(`/api/video/info/${route.params.vidId}`);
	// console.log(vidDetails);

	if (vidDetails.path.endsWith("mkv")) {
		// console.log("Use MKV Extract");
		vidType.value = "video/webm";
	} else {
		vidType.value = "video/mp4";
	}

	const t = await $fetch(`/api/attributes/${route.params.vidId}`);
	// console.log(t);
	if (t.length > 0) {
		if (t[0].tag !== null) {
			tags.value = t[0].tag.split(",");
		}
		if (t[0].rating !== null) {
			rating.value = t[0].rating;
		}
		if (t[0].officialVideo === 1) {
			attributes.value.push("Official Video");
		}
		if (t[0].highCam === 1) {
			attributes.value.push("High Cam");
		}
		if (t[0].percussionCam === 1) {
			attributes.value.push("Percussion Cam");
		}
		if (t[0].guardCam === 1) {
			attributes.value.push("Guard Cam");
		}
		if (t[0].finalsVideo === 1) {
			attributes.value.push("Finals Video");
		}
		if (t[0].unofficialVideo === 1) {
			attributes.value.push("Unofficial Video");
		}

		viewCntr.value = t[0]?.viewCntr ? t[0].viewCntr + 1 : 1;
		console.log(t[0]?.viewCntr);
		console.log(viewCntr.value);
	}

	await $fetch(`/api/attributes/${route.params.vidId}`, {
		method: "post",
		body: {
			viewCntr: viewCntr.value,
		},
	});
});

async function ratingChange(x) {
	// console.log(x.value);
	await $fetch(`/api/attributes/${route.params.vidId}`, {
		method: "post",
		body: { rating: x.value },
	});
}

async function tagUpdate(x) {
	// console.log("tags changed", x);
	// console.log("update db to ", x.value);

	await $fetch(`/api/attributes/${route.params.vidId}`, {
		method: "post",
		body: { tags: x.value },
	});
}
// Dont know why this works but it does...
const searchTags = (event) => {
	// console.log("search tags:", event.query);

	tags.value = [...Array(10).keys()].map((item) => `${event.query}-${item}`);
};

const attributes = ref([]);
async function checkChange() {
	const postBody = {};

	// console.log("attributes changed", attributes.value);
	if (attributes.value.includes("Official Video")) {
		postBody.officialVideo = 1;
	} else {
		postBody.officialVideo = 0;
	}
	if (attributes.value.includes("High Cam")) {
		postBody.highCam = 1;
	} else {
		postBody.highCam = 0;
	}
	if (attributes.value.includes("Percussion Cam")) {
		postBody.percussionCam = 1;
	} else {
		postBody.percussionCam = 0;
	}
	if (attributes.value.includes("Guard Cam")) {
		postBody.guardCam = 1;
	} else {
		postBody.guardCam = 0;
	}
	if (attributes.value.includes("Unofficial Video")) {
		postBody.unofficialVideo = 1;
	} else {
		postBody.unofficialVideo = 0;
	}
	if (attributes.value.includes("Finals Video")) {
		postBody.finalsVideo = 1;
	} else {
		postBody.finalsVideo = 0;
	}

	await $fetch(`/api/attributes/${route.params.vidId}`, {
		method: "post",
		body: postBody,
	});
}

const playerDiv = ref(null);

const makeBigger = () => {
	console.log("bigger");
	playerDiv.value.style.width = `${Number.parseInt(playerDiv.value.offsetWidth) + 10}px`;
};

function makeSmaller() {
	console.log("smaller");

	console.log(playerDiv.value);
	// console.log(playerDiv.value.offsetWidth);
	// console.log(playerDiv.value.style.width);
	playerDiv.value.style.width = `${Number.parseInt(playerDiv.value.offsetWidth) - 10}px`;
}

function muteVolume() {
	console.log("mute");
	prefsStore.toggleMute();
}
function volumeUp() {
	console.log("vol up");
	prefsStore.volUp();
}
function volumeDown() {
	console.log("vol down");
	prefsStore.volDown();
}
</script>
<template>
  <div class="flex flex-col md:flex-row md:space-x-4">
    <div class="md:w-2/3 bg-white shadow-md rounded-lg">
      <!-- <p class="text-gray-700">        
				Video ID: {{ $route.params.vidId }}
      </p> -->

      <Panel>
        <template #header>
          <div class="flex items-center gap-2">
            <h1 class="m-2 ml-6">
              <span class="text-4xl font-bold">
                <NuxtLink :to="'/corps/' + corpsId">{{ name }}</NuxtLink> &nbsp;
              </span>
              <span class="text-xl">
                <NuxtLink :to="'/years/' + year"> {{ year }} </NuxtLink>
              </span>
            </h1>
          </div>
        </template>
        <template #icons>
          <Button
            severity="contrast"
            variant="text"
            raised
            rounded
            @click="makeBigger"
            class="mr-2"
          >
            <OhVueIcon name="bi-zoom-in" />
          </Button>

          <Button
            icon="pi pi-minus"
            severity="contrast"
            variant="text"
            raised
            rounded
            @click="makeSmaller"
          >
            <OhVueIcon name="bi-zoom-out" />
          </Button>
        </template>
        <template #footer>
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <Button
                severity="contrast"
                variant="text"
                raised
                rounded
                @click="muteVolume"
                class="mr-2"
              >
                <OhVueIcon name="fa-volume-mute" />
              </Button>
             <Button
                severity="contrast"
                variant="text"
                raised
                rounded
                @click="volumeDown"
                class="mr-2"
              >
                <OhVueIcon name="fa-volume-down" />
              </Button>
              <span>
              {{ volume }}
              </span>
              
               <Button
                severity="contrast"
                variant="text"
                raised
                rounded
                @click="volumeUp"
                class="mr-2"
              >
                <OhVueIcon name="fa-volume-up" />
              </Button>
            </div>
          </div>
        </template>

        <div class="object-cover m-0" ref="playerDiv">
          <video-player
            :options="videoOptions"
            :vidId="$route.params.vidId"
            :vidType="vidType"
          />
        </div>
      </Panel>
    </div>
    <div class="md:w-1/3 bg-gray-100 shadow-md rounded-lg p-4">
      <!-- <h2 class="text-xl font-bold mb-2">Sidebar</h2> -->
      <!-- <p class="text-gray-700">This should be what they played along with scores.
				This needs to scroll independently from the main/video column
			</p> -->
      <Panel header="Finals Placement" v-if="score !== null">
        <p class="text-gray-700">
          Place {{ position + getOrdinalSuffix(Number.parseInt(position)) }}
        </p>
        <p class="text-gray-700">Score {{ score }}</p>
        <p class="text-gray-700">Views: {{ viewCntr }}</p>
      </Panel>
      <hr class="mb-2 mt-2" />
      <Panel :header="title">
        <ul class="list-disc list-inside" v-for="one in repArray">
          <li class="text-gray-700">{{ one }}</li>
        </ul>
      </Panel>
      <hr class="mb-2 mt-2" />
      <Panel header="Tags">
        <AutoComplete
          v-model="tags"
          inputId="multiple-ac-2"
          multiple
          fluid
          @complete="searchTags"
          @change="tagUpdate"
          :typeahead="false"
        />
        <Rating v-model="rating" @change="ratingChange" class="mt-2" />
      </Panel>
      <hr class="mb-2 mt-2" />
      <Panel header="Video Attributes">
        <div class="card flex flex-wrap justify-center gap-4">
          <div class="flex items-center gap-2">
            <Checkbox
              v-model="attributes"
              inputId="ingredient1"
              name="attributes"
              value="High Cam"
              @update:modelValue="checkChange"
            />
            <label for="ingredient1"> High Cam </label>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox
              v-model="attributes"
              inputId="ingredient2"
              name="attributes"
              value="Percussion Cam"
              @update:modelValue="checkChange"
            />
            <label for="ingredient2"> Percussion Cam </label>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox
              v-model="attributes"
              inputId="ingredient3"
              name="attributes"
              value="Guard Cam"
              @update:modelValue="checkChange"
            />
            <label for="ingredient3"> Guard Cam </label>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox
              v-model="attributes"
              inputId="ingredient4"
              name="attributes"
              value="Official Video"
              @update:modelValue="checkChange"
            />
            <label for="ingredient4"> Official Video </label>
          </div>

          <div class="flex items-center gap-2">
            <Checkbox
              v-model="attributes"
              inputId="ingredient5"
              name="attributes"
              value="Unofficial Video"
              @update:modelValue="checkChange"
            />
            <label for="ingredient5"> Unofficial Video </label>
          </div>

          <div class="flex items-center gap-2">
            <Checkbox
              v-model="attributes"
              inputId="ingredient6"
              name="attributes"
              value="Finals Video"
              @update:modelValue="checkChange"
            />
            <label for="ingredient6"> Finals Video </label>
          </div>
        </div>
      </Panel>

      <!-- <p class="text-gray-700">Add bitrate, codec, container, channels and sample rate</p> -->
    </div>
  </div>
</template>
