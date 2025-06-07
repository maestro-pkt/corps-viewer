<script setup lang="js">
import { ref, onMounted } from "vue";
import { useByYearsStore } from "@/stores/byYear.js";
import { FilterMatchMode } from "@primevue/core/api";

import { useCorpsStore } from "@/stores/corps.js";
import { useCrumbStore } from "@/stores/breadcrumb.js";
import { storeToRefs } from "pinia";

const route = useRoute();
const router = useRouter();
const yearsStore = useByYearsStore();

const corps = ref([]);
const selectedCorps = ref();

const crumbStore = useCrumbStore();
const { name, corpsId, year, position, score, title, rep } = storeToRefs(
	useCorpsStore(),
);

const { history } = storeToRefs(useCrumbStore());

/* Division examples:
                    Junior
              Senior
              All Age
              All Girl
              Parade
              International
              Military
              Alumni
              Sound Sport
              Minicorps
                    */

/* DataTable multisort example
  this.d_multiSortMeta = [
                      { field: this.sortField, order: this.sortOrder || this.defaultSortOrder },
                      { field: this.d_sortField, order: this.d_sortOrder }
                  ];
  */

const multiSortMeta = [
	{
		field: "division",
		order: "1",
	},
	{
		field: "position",
		order: 1,
	},
];

onMounted(async () => {
	corps.value = yearsStore.getYear(route.params.year);
});

async function selectCorps(item) {
	console.log(item.data);
	year.value = route.params.year;
	name.value = item.data.name;
	corpsId.value = item.data.corpsId;
	position.value = item.data.position;
	score.value = item.data.score;
	title.value = item.data.title;
	rep.value = item.data.rep;

	crumbStore.add({
		route: route,
		name: `Scores from ${year.value}`,
	});
	console.log("Navigate to", `/y-${route.params.year}/c-${item.data.corpsId}`);
	await navigateTo(`/y-${route.params.year}/c-${item.data.corpsId}`);
}

function divisionChange(event) {
	console.log(event);
	if (event.value !== null) {
		// console.log(event.value.value);
		filters.value.global.value = event.value.value;
	} else {
		// console.log("event.value is null");
		filters.value.global.value = null;
	}
}
const filters = ref({
	global: { value: null, matchMode: FilterMatchMode.CONTAINS },
	division: { value: null, matchMode: FilterMatchMode.EQUALS },
});
const filterValue = ref();
const filterOptions = ref([
	{ value: "Junior" },
	{ value: "Senior" },
	{ value: "Alumni" },
	{ value: "All Age" },
	{ value: "Sound Sport" },
	{ value: "International" },
]);
</script>

<template>
  <!-- {{ $route.params.year }} -->
  <!-- {{ selectedCorps }} -->
  <div class="ml-2 mr-2 mx-auto bg-white rounded-lg shadow-md overflow-hidden">
    <div class="p-6">
      <h2 class="text-xl font-bold mb-2">{{ route.params.year }}</h2>

      <DataTable
        :value="corps"
        v-model:selection="selectedCorps"
        selectionMode="single"
        sortMode="multiple"
        :multiSortMeta="multiSortMeta"
        scrollable
        stripedRows
        tableStyle="min-width: 50rem; max-height: 50%"
        @rowSelect="selectCorps"
        v-model:filters="filters"
        filterDisplay="row"
      >
        <template #header>
          <div class="flex justify-beginning">
            <Fieldset legend="Filter">
            
            <SelectButton
              v-model="filterValue"
              :options="filterOptions"
              optionLabel="value"
              dataKey="value"
              aria-labelledby="custom"
              @change="divisionChange"
            >
              <template #option="slotProps">
                {{ slotProps.option.value }}
              </template>
            </SelectButton>
            </Fieldset>
          </div>
        </template>

        <Column field="name" header="Name" sortable></Column>
        <Column field="position" header="Position" sortable></Column>
        <Column field="score" header="Score" sortable></Column>
        <Column field="title" header="Title" sortable></Column>
        <Column field="videoCnt" header="#Vids" sortable></Column>
        <Column field="rep" header="Rep">
          <template #body="slotProps">
            {{ slotProps.data.rep.split('~!~').join(' -- ') }}
          </template>
        </Column>
        <Column field="division" header="Division" sortable></Column>
      </DataTable>

    </div>
  </div>
</template>
