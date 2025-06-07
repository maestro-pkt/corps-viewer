<script setup lang="js">
import { useByYearsStore } from "@/stores/byYear.js";
// import { useCorpsStore } from "./stores/corps.js";
// import { useCrumbStore } from "./stores/breadcrumb.js";
import { storeToRefs } from "pinia";

const route = useRoute();
const crumbStore = useCrumbStore();

const { year } = storeToRefs(useCorpsStore());
const { history } = storeToRefs(useCrumbStore());

const yearsStore = useByYearsStore();
const yearList = yearsStore.getYears();

async function switchToYear(y) {
	console.log(y);
	year.value = y;

	crumbStore.add({
		route: route,
		name: "Years List",
	});

	await navigateTo(`/years/${y}`);
}
</script>

<template>
  <div class="ml-2 mr-2 mx-auto bg-white rounded-lg shadow-md overflow-hidden">
    <div class="p-6">
      <h2 class="text-xl font-bold mb-2">Year Selection</h2>
      <div class="grid grid-rows-4 grid-flow-col gap-1">
              <div v-for="(oneYear, idx) in yearList" :id="idx">
        <div>
          <Button @click="switchToYear(oneYear)" class="mb-2">{{
            oneYear
          }}</Button>
        </div>

        
      </div>
      </div>
    </div>
  </div>
</template>
