<script setup>
import { ref, onMounted } from "vue";
import { FilterMatchMode } from "@primevue/core/api";

import { useByCorpsStore } from "@/stores/byCorps.js";

// import { useCorpsStore } from "../stores/corps.js";
// import { useCrumbStore } from "../stores/breadcrumb.js";
import { storeToRefs } from "pinia";

const crumbStore = useCrumbStore();
const corpsStore = useByCorpsStore();

const { name, corpsId } = storeToRefs(useCorpsStore());
// const { history } = storeToRefs(useCrumbStore());

const route = useRoute();

const corps = ref();

onMounted(async () => {
	//corps.value = await $fetch("/api/corps");
	corps.value = corpsStore.getCorps();
	// console.log(corps.value);

	//	throw new Error("2 Error Thrown on purpose to send it to Bugsink");
});

const selectedCorps = ref();

async function selectCorps(item) {
	// console.log(item.data);
	name.value = item.data.name;
	corpsId.value = item.data.corpsId;
	// position.value = item.data.position;
	// score.value = item.data.score;
	// rep.value = item.data.rep;

	crumbStore.add({
		route: route,
		name: "Corps List",
	});

	await navigateTo(`/corps/${item.data.corpsId}`);
}

const filters = ref({
	global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
</script>

<template>
  <Card class="p-2">
    <template #content>
    <DataTable
      :value="corps"
      v-model:selection="selectedCorps"
      v-model:filters="filters"
      :globalFilterFields="['name', 'years']"
      filterDisplay="row"
      @rowSelect="selectCorps"
      selectionMode="single"
      sortMode="single"
      sortField="name"
      scrollable
      dataKey="id"
      tableStyle="min-width: 60rem"
    >
      <template #header>
        <div class="flex justify-start">
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

      <Column field="name" header="Name" sortable></Column>
      <Column field="numYears" header="# of Years" sortable></Column>
      <Column field="years" header="Years" sortable>
        <template #body="slotProps">
          {{ slotProps.data.years.join(', ') }}
        </template>
      </Column>
      <template #empty> No corps found. </template>
    </DataTable>
   </template>
  </Card>
</template>
