<script setup lang="js">
import VideoPlayer from "@/components/VideoPlayer.vue";
import "video.js/dist/video-js.css";
import {
  BiZoomIn,
  BiZoomOut,
  FaVolumeMute,
  FaVolumeUp,
  FaVolumeDown,
  MdForward10Twotone,
  MdForward30,
} from "oh-vue-icons/icons";
import { OhVueIcon, addIcons } from "oh-vue-icons";
import { ref } from "vue";
import { usePrefsStore } from "@/stores/prefs.js";
import { useCorpsStore } from "@/stores/corps.js";
import { useCrumbStore } from "@/stores/breadcrumb.js";
import { storeToRefs } from "pinia";
import VideoAttributes from "~/components/VideoAttributes.vue";
import ScoreRep from "~/components/ScoreRep.vue";


addIcons(
  BiZoomIn,
  BiZoomOut,
  FaVolumeMute,
  FaVolumeUp,
  FaVolumeDown,
  MdForward10Twotone,
  MdForward30,
);


const route = useRoute();
// const {
//   //year, 
//   name, position, score, title, rep,
//   //corpsId 
// } = storeToRefs(
//   useCorpsStore(),
// );


const prefsStore = usePrefsStore();
const { volume } = storeToRefs(prefsStore);

const name = ref("");
const position = ref(0);
const score = ref(0.0);
const title = ref("Repertoire");
const rep = ref("");
const vidType = ref();
const corpsId = ref();
const year = ref();


const videoOptions = {
  autoplay: true,
  controls: true,
  fluid: true,
  //fill: true,
  inactivityTimeout: 0, // 0 indicates that the user will never be considered inactive.
  enableSmoothSeeking: true,
  sources: [],
  playsinline: true,
  enableDocumentPictureInPicture: true,
  controlBar: {
    skipButtons: {
      forward: 10,
      backward: 10,
    },
  },
};



onMounted(async () => {
  const vidDetails = await $fetch(`/api/video/info/file/${route.params.vidId}`);
  console.log("vid details", vidDetails);
  corpsId.value = vidDetails.corpsId;
  year.value = vidDetails.year;


  if (vidDetails.path.endsWith("mkv")) {
    // console.log("Use MKV Extract");
    vidType.value = "video/webm";
  } else {
    vidType.value = "video/mp4";
  }

  const showDetails = await $fetch(`/api/video/info/show?corpsId=${vidDetails.corpsId}&year=${vidDetails.year}`);
  console.log("show details", showDetails);
  if (showDetails) {
    position.value = showDetails.position;
    score.value = showDetails.score;
    title.value = showDetails.title;
    rep.value = showDetails.rep;
    name.value = showDetails.name;
  } else {
    console.error("No show details found for corpsId:", newCorpsId);
  }
});

const playerDiv = ref(null);

const makeBigger = () => {
  console.log("bigger");
  playerDiv.value.style.width = `${Number.parseInt(playerDiv.value.offsetWidth) + 10}px`;
};

function makeSmaller() {
  console.log("smaller");
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
function skip10() {
  console.log("skip 10");
  prefsStore.skip10Sec();

}
function skip30() {
  console.log("skip 30");
  prefsStore.skip30Sec();

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
          <Button severity="contrast" variant="text" raised rounded @click="makeBigger" class="mr-2">
            <OhVueIcon name="bi-zoom-in" />
          </Button>

          <Button icon="pi pi-minus" severity="contrast" variant="text" raised rounded @click="makeSmaller">
            <OhVueIcon name="bi-zoom-out" />
          </Button>
        </template>
        <template #footer>
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <Button severity="contrast" variant="text" raised rounded @click="muteVolume" class="mr-2">
                <OhVueIcon name="fa-volume-mute" />
              </Button>
              <Button severity="contrast" variant="text" raised rounded @click="volumeDown" class="mr-2">
                <OhVueIcon name="fa-volume-down" />
              </Button>
              <span>
                {{ volume }}
              </span>

              <Button severity="contrast" variant="text" raised rounded @click="volumeUp" class="mr-2">
                <OhVueIcon name="fa-volume-up" />
              </Button>

              <Button severity="contrast" variant="text" raised rounded @click="skip10" class="mr-2">
                <OhVueIcon name="md-forward10-twotone" />
              </Button>

              <Button severity="contrast" variant="text" raised rounded @click="skip30" class="mr-2">
                <OhVueIcon name="md-forward30" />
              </Button>
            </div>
          </div>
        </template>

        <div class="object-cover m-0" ref="playerDiv">
          <video-player :options="videoOptions" :vidId="$route.params.vidId" :vidType="vidType" />
        </div>
      </Panel>
    </div>
    <div class="md:w-1/3 bg-gray-100 shadow-md rounded-lg p-4">

      <ScoreRep :position="position" :score="score" :title="title" :rep="rep" />
      <VideoAttributes :vidId="$route.params.vidId" />


    </div>
  </div>
</template>
