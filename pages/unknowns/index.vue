<script setup>
import { ref, onMounted } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import VideoPlayer from "@/components/VideoPlayer.vue";
import "video.js/dist/video-js.css";
import UnknownForm from "~/components/UnknownForm.vue";

const route = useRoute();
const unks = ref();

onMounted(async () => {
	unks.value = await $fetch("/api/unknowns");
	// console.log(unks.value);
});

const selectedFile = ref();
const vidId = ref();
const vidType = ref("video/mp4");

function selectFile(item) {
	console.log(item.data);
	vidId.value = Number(item.data.key).toString();
	selectedFile.value = item.data;
}

const filters = ref({
	global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const videoOptions = {
	autoplay: true,
	controls: true,
	fluid: true,
	//fill: true,
	inactivityTimeout: 0, // 0 indicates that the user will never be considered inactive.
	enableSmoothSeeking: true,
	sources: [],
};
</script>

<template>
  
  <div class="container mx-auto px-4">
  <div class="flex flex-col md:flex-row gap-4">
    <!-- Column 1 -->
    <div class="md:w-1/3 bg-gray-100 p-4 rounded-lg">
      <h2 class="text-xl font-bold mb-2">Column 1</h2>
      <p>This is the content for column 1.</p>
      <Card class="p-2">
    <template #content>
      
    <DataTable
      :value="unks"
      v-model:selection="selectedFile"
      v-model:filters="filters"
      :globalFilterFields="['name', 'years']"
      filterDisplay="row"
      
      @rowClick="selectFile"
      selectionMode="single"
      sortMode="single"
      sortField="name"      
      dataKey="key"
      scrollable scrollHeight="400px" :virtualScrollerOptions="{ itemSize: 46 }" tableStyle="min-width: 15rem"
      
    >
      <template #header>
        <div class="flex justify-end">
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText
              v-model="filters['global'].value"
              placeholder="Search"
            />
          </IconField>
        </div>
      </template>
      <template #loading> Loading data. Please wait. </template>

      <Column field="filename" header="Name" sortable></Column>
      <!-- <Column field="numYears" header="# of Years" sortable></Column>
      <Column field="years" header="Years" sortable>
        <template #body="slotProps">
          {{ slotProps.data.years.join(', ') }}
        </template>
      </Column> -->
      <template #empty> No unknowns found. </template>
    </DataTable>
   </template>
  </Card>

    </div>

    <!-- Column 2 -->
    <div class="md:w-1/3 bg-gray-100 p-4 rounded-lg">
      <h2 class="text-xl font-bold mb-2">Column 2</h2>
      <p>This is the content for column 2.</p>
      <p> VidID:{{ vidId }}</p>
      <p>Type: {{ vidType }}</p>
       <video-player
          :options="videoOptions"
          :vidId="vidId"
          :vidType="vidType"
          endpoint="/api/unknowns"
        />
    </div>

    <!-- Column 3 -->
    <div class="md:w-1/3 bg-gray-100 p-4 rounded-lg">
      <h2 class="text-xl font-bold mb-2">Column 3</h2>
      <p>This is the content for column 3.</p>
      <UnknownForm :record="selectedFile" />
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
</div>
</template>
