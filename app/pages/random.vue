<script setup>
import { ref, onMounted } from "vue";
import { IoRefreshSharp } from "oh-vue-icons/icons";
import { OhVueIcon, addIcons } from "oh-vue-icons";

import { FilterMatchMode } from "@primevue/core/api";
import VideoPlayer from "@/components/VideoPlayer.vue";
import "video.js/dist/video-js.css";

addIcons(IoRefreshSharp);

const route = useRoute();
const random = ref();

async function refresh() {
	random.value = await $fetch("/api/random");
}

onMounted(async () => {
	random.value = await $fetch("/api/random");
	console.log(random.value);
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
	playsinline: true,
};
</script>

<template>

  <div class="container mx-auto px-4 ">
    <div class="flex flex-col md:flex-row gap-4">
      <!-- Column 2 -->
      <div class="md:w-1/2 bg-gray-100 p-4 rounded-lg">
        <!-- <h2 class="text-xl font-bold mb-2">Column 2</h2> -->
        <!-- <p>This is the content for column 2.</p> -->
        <p> VidID:{{ vidId }}</p>
        <p>Type: {{ vidType }}</p>
       <video-player :options="videoOptions" :vidId="vidId" :vidType="vidType" />
   
      </div>

      <!-- Column 1 -->
      <div class="md:w-1/2 bg-gray-100 p-4 rounded-lg">
        <!-- <h2 class="text-xl font-bold mb-2">Column 1</h2> -->
        <!-- <p>This is the content for column 1.</p> -->
        <Card class="p-2">
          <template #content>

            <DataTable :value="random" v-model:selection="selectedFile" v-model:filters="filters"
              :globalFilterFields="['name', 'years']" filterDisplay="row" @rowClick="selectFile" selectionMode="single"
              sortMode="single" sortField="name" dataKey="key" scrollable tableStyle="min-width: 15rem">
              <!-- scrollHeight="400px" :virtualScrollerOptions="{ itemSize: 46 }" -->

              <template #header>
                <div class="flex justify-start">

                </div>
                <div class="flex justify-end">
                  <Button @click="refresh()" class="p-button-rounded p-button-text">
                    <OhVueIcon name="io-refresh-sharp" />
                  </Button>
                  <IconField>
                    <InputIcon>
                      <i class="pi pi-search" />
                    </InputIcon>
                    <InputText v-model="filters['global'].value" placeholder="Search" />
                  </IconField>
                </div>
              </template>
              <template #loading> Loading data. Please wait. </template>

              <Column field="title" header="Name" sortable></Column>
              <Column field="duration" header="Duration" sortable></Column>

              <template #empty> No random shows found. </template>
            </DataTable>
          </template>
        </Card>

      </div>





    </div>
  </div>
</template>
