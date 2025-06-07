<script setup lang="js">
import { ref, onMounted } from "vue";
import { useCorpsStore } from "@/stores/corps.js";
import { useCrumbStore } from "@/stores/breadcrumb.js";

import { useByCorpsStore } from "@/stores/byCorps.js";
import { storeToRefs } from "pinia";
import { sprintf } from "sprintf-js";

const route = useRoute();
const router = useRouter();

const crumbStore = useCrumbStore();
const { name, corpsId, year, position, score, title, rep } = storeToRefs(
	useCorpsStore(),
);
const { history } = storeToRefs(useCrumbStore());

const corpsStore = useByCorpsStore();

const videoList = ref([]);
const selectedVideo = ref();

async function playShow(item) {
	console.log("must set the corps store to the corps name and year!");

	console.log(item.data);

	year.value = item.data.year;
	name.value = item.data.name;
	corpsId.value = route.params.corpsId;
	position.value = item.data?.position;
	score.value = item.data?.score;
	title.value = item.data?.title;
	rep.value = item.data?.rep;

	crumbStore.add({
		route: route,
		name: `${name.value} ${year.value}`,
	});

	await navigateTo(`/play/${item.data.key}`);
}

onMounted(async () => {
	videoList.value = await $fetch("/api/recents");

	console.log(
		"hit up the byCorps store and get the corps name and years and details.;  then update the datatable to show the corps name and year too",
	);

	for (const oneVid of videoList.value) {
		const c = corpsStore.getCorpsById(oneVid.corpsId);
		oneVid.name = c.name;

		oneVid.position = c.years[oneVid.year]?.position;
		oneVid.score = c.years[oneVid.year]?.score;
		oneVid.title = c.years[oneVid.year]?.title;
		oneVid.rep = c.years[oneVid.year]?.rep;

		//oneVid.fileinfo = JSON.parse(oneVid.fileinfo);
		const parts = oneVid.fileinfo.split("|");
		oneVid.bitrate = parts[0];
		oneVid.codec = parts[1];
		oneVid.numberOfChannels = parts[2];
		oneVid.sampleRate = parts[3];
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
</script>

<template>

	<h1 class="m-2 ml-6">
		Recents
	</h1>
	<!-- {{ videoList }} -->
	<DataTable v-model:selection="selectedVideo" :value="videoList" @rowSelect="playShow" selectionMode="single"
		sortMode="single"  scrollable tableStyle="min-width: 50rem"
		breakpoint="960px"
		
		>
		<Column field="name" sortable header="Name"></Column>
		<Column field="year" sortable header="Year"></Column>
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
		<Column field="filetype" sortable header="Container"></Column>
		<Column field="numberOfChannels" sortable header="Channels"></Column>
		<Column field="sampleRate" sortable header="SampleRate">
			<template #body="slotProps">
				{{ formatSampleRate(slotProps.data.sampleRate) }}
			</template>
		</Column>
	</DataTable>

</template>

