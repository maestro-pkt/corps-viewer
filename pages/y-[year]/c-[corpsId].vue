<script setup lang="js">
import { ref, onMounted } from "vue";
import { useCorpsStore } from "@/stores/corps.js";
import { useCrumbStore } from "@/stores/breadcrumb.js";
import { useByYearsStore } from "@/stores/byYear.js";
import { storeToRefs } from "pinia";
import { sprintf } from "sprintf-js";

const route = useRoute();
const router = useRouter();

const crumbStore = useCrumbStore();
const { name, corpsId, year, position, score, rep } = storeToRefs(
	useCorpsStore(),
);
const { history } = storeToRefs(useCrumbStore());

const yearsStore = useByYearsStore();

const videoList = ref([]);
const selectedVideo = ref();

async function playShow(item) {
	crumbStore.add({
		route: route,
		name: `${name.value} ${year.value}`,
	});
	// console.log(item.data);

	await navigateTo(`/play/${item.data.key}`);
}

onMounted(async () => {
	videoList.value = yearsStore.getCorpsShowsFromYear(
		route.params.year,
		route.params.corpsId,
	);
	// console.log(videoList.value);

	if (videoList.value?.length) {
		for (const oneVid of videoList.value) {
			//oneVid.fileinfo = JSON.parse(oneVid.fileinfo);
			const parts = oneVid.fileinfo.split("|");
			oneVid.bitrate = parts[0];
			oneVid.codec = parts[1];
			oneVid.numberOfChannels = parts[2];
			oneVid.sampleRate = parts[3];
		}
	}
});

function formatSampleRate(value) {
	return `${sprintf("%0.1f", Number.parseFloat(value) / 1000)}k`;
}

function formatBitrate(value) {
	try {
		const br = Number.parseFloat(value) / 1000;
		if (Number.isNaN(br)) {
			return "";
		}
		return `${Math.floor(br)}k`;
	} catch (e) {
		return "";
	}
}

const viewport = useViewport();

watch(viewport.breakpoint, (newBreakpoint, oldBreakpoint) => {
	console.log("Breakpoint updated:", oldBreakpoint, "->", newBreakpoint);
});
</script>

<template>
	<!-- {{ $route.params }} -->
	
	<h1 class="m-2 ml-6">
		<span class="text-4xl font-bold">
			 <NuxtLink :to="'/corps/' + corpsId">{{ name }}</NuxtLink>
			&nbsp;</span>
		<span class="text-xl">
			         <NuxtLink :to="'/years/' + year"> {{ year }} </NuxtLink>			
</span>
	</h1>

	<div>
    <div v-if="viewport.isLessThan('tablet')">Should render only on mobile

<div v-for="(vid, index) in videoList" :key="index">
		<div class="p-2 m-2 border rounded-lg">
			<h2 class="text-xl font-bold">{{ vid.title }}</h2>
			<p>Duration: {{ vid.duration }}</p>
			<p>Filename: {{ vid.path }}</p>
			<p>Resolution: {{ vid.resolution }}</p>
			<p>Bitrate: {{ formatBitrate(vid.bitrate) }}</p>
			<p>Codec: {{ vid.codec }}</p>
			<p>Sample Rate: {{ formatSampleRate(vid.sampleRate) }}</p>
			<Button @click="playShow({ data: vid })" label="Play Show"></Button>
		</div>
		<hr />
</div>


		</div>
    <div v-else>Current breakpoint: {{ viewport.breakpoint }}

	<!-- {{ videoList }} -->
	<DataTable v-model:selection="selectedVideo" :value="videoList" @rowSelect="playShow" selectionMode="single"
		sortMode="single" sortField="duration" scrollable tableStyle="min-width: 50rem">
		<Column field="duration" sortable header="Duration"></Column>
		<Column field="title" sortable header="Title"></Column>
		<Column field="path" sortable header="Filename"></Column>
		<Column field="resolution" sortable header="Resolution"></Column>
		<Column field="bitrate" sortable header="Bitrate">
			<template #body="slotProps">
				{{ formatBitrate(slotProps.data.bitrate) }}
			</template>
		</Column>
		<Column field="codec" sortable header="Codec"></Column>
		<!-- <Column field="filetype" sortable header="Container"></Column> -->
		<!-- <Column field="numberOfChannels" sortable header="Channels"></Column> -->
		<Column field="sampleRate" sortable header="SampleRate">
			<template #body="slotProps">
				{{ formatSampleRate(slotProps.data.sampleRate) }}
			</template>
		</Column>
	</DataTable>
</div>
  </div>
</template>
