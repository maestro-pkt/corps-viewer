<script setup lang="js">
import { ref, onMounted } from "vue";
import { useCorpsStore } from "@/stores/corps.js";
import { useByCorpsStore } from "@/stores/byCorps.js";
import { useCrumbStore } from "@/stores/breadcrumb.js";
import { storeToRefs } from "pinia";

const corpsStore = useByCorpsStore();

const route = useRoute();
const router = useRouter();
const selectedShow = ref();
const showList = ref([]);

const crumbStore = useCrumbStore();
const { name, corpsId, year, position, score, title, rep } = storeToRefs(
	useCorpsStore(),
);
const { history } = storeToRefs(useCrumbStore());

onMounted(async () => {
	const corpsYears = corpsStore.getCorpsById(route.params.corpsId);
	showList.value = Object.keys(corpsYears.years)
		.map((oneKey) => {
			return corpsYears.years[oneKey];
		})
		.reverse();

	// console.log(showList.value);
});

async function selectShow(item) {
	console.log(item.data);
	year.value = item.data.year;
	//name.value = item.data.name;
	corpsId.value = route.params.corpsId;
	position.value = item.data.position;
	score.value = item.data.score;
	title.value = item.data.title;
	rep.value = item.data.rep;

	crumbStore.add({
		route: route,
		name: name.value,
	});
	console.log("Navigate to", `/y-${item.data.year}/c-${route.params.corpsId}`);
	await navigateTo(`/y-${item.data.year}/c-${route.params.corpsId}`);
}
</script>

<template>

<div class="ml-2 mr-2 mx-auto bg-white rounded-lg shadow-md overflow-hidden">
  
  <div class="p-6">
    <h2 class="text-xl font-bold mb-2">{{name}}</h2>
 <DataTable
    :value="showList"
    v-model:selection="selectedShow"
    selectionMode="single"
    sortMode="single"
    sortField="year"
    :sortOrder="-1"
    scrollable    
		stripedRows 
    tableStyle="min-width: 50rem; "
    @rowSelect="selectShow"
  >
  
    <Column field="year" header="Year"></Column>
    <Column field="position" header="Position" sortable></Column>
    <Column field="score" header="Score" sortable></Column>
    <Column field="title" header="Title">
		<!-- <template #body="slotProps">
			<b>{{ slotProps.data.title }}</b>
			</template> -->
		</Column>
		<Column field="shows" header="#Vids">
		<template #body="slotProps">			
				{{slotProps.data.shows.length}}
		</template>
		</Column>
    <Column field="rep" header="Rep">
		<template #body="slotProps">
			{{ slotProps.data.rep.split('~!~').join(' -- ') }}
		</template></Column>
		<Column field="division" header="Division" sortable></Column>
  </DataTable>


  </div>
</div>
</template>