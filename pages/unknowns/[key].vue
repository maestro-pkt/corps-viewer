<script setup lang="js">
import VideoPlayer from "@/components/VideoPlayer.vue";
import "video.js/dist/video-js.css";

const route = useRoute();

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

onMounted(async () => {
	// const vidDetails = await $fetch(`/api/video/info/${route.params.vidId}`);
	// // console.log(vidDetails);

	// if (vidDetails.path.endsWith("mkv")) {
	// 	// console.log("Use MKV Extract");
	// 	vidType.value = "video/webm";
	// } else {
	vidType.value = "video/mp4";
	// }
});
</script>
<template>
  <div class="flex flex-col md:flex-row md:space-x-4 p-6">
    <div class="md:w-2/3 bg-white shadow-md rounded-lg p-4">
      
      <!-- <p class="text-gray-700">        
				Video ID: {{ $route.params.vidId }}
      </p> -->

      <div class="object-cover">
        <video-player
          :options="videoOptions"
          :vidId="$route.params.key"
          :vidType="vidType"
          endpoint="/api/unknowns"
        />
      </div>
    </div>
    <div class="md:w-1/3 bg-gray-100 shadow-md rounded-lg p-4">
      <h2 class="text-xl font-bold mb-2">Sidebar</h2>
      <p class="text-gray-700">
        This is where the form goes to fill out the info for the "files" table.

        This will need something to select the corps name, year, etc.
        Then a save/cancel button.
        Save will make a post to /api/unknowns that inserts the file and its info into the files table and deletes this key from the unknowns table.

        This won't show up until the Config->Scan action is done. So probably want to also allow the Scan to be kicked off after Save is clicked.  Or maybe a "Save & Scan" button too.
      </p>
      <p> Or another idea is to convert the unknown index page into a three column layout and
        when a fill is selected, it plays in the middle column and the form shows up in the right column.  This would allow us to more quickly iterate through the unknown files.
      </p>
      
    </div>
  </div>
</template>
