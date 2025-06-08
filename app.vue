<script setup lang="js">
import { onMounted, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import { useCrumbStore } from "./stores/breadcrumb.js";
import { storeToRefs } from "pinia";
import { useByCorpsStore } from "./stores/byCorps.js";

import { useByYearsStore } from "./stores/byYear.js";

import { OiGear } from "oh-vue-icons/icons";
import { OhVueIcon, addIcons } from "oh-vue-icons";

addIcons(OiGear);

const route = useRoute();
const router = useRouter();
const crumbStore = useCrumbStore();
const { history } = storeToRefs(crumbStore);

onBeforeMount(async () => {
	console.log("App.vue mounted");
	try {
		const corpsData = await fetch("/api/stores/corps");
		useByCorpsStore().load(await corpsData.json());

		const yearsData = await fetch("/api/stores/years");
		useByYearsStore().load(await yearsData.json());
	} catch (error) {
		console.error("Error loading data:", error);
	}
});

const home = ref({
	route: { path: "/", href: "/" },
	name: "Main Page",
});

router.beforeEach((to, from, next) => {
	// Do something before navigation happens
	console.log("Route changing from:", from.path, "to:", to.path);
	// console.log(from, to);

	//crumbStore.add(from);
	// console.log("hist:");
	// console.log(history);

	// Allow navigation to continue
	next();
});

function gotoConfig() {
	router.push("/config");
}

const items = ref([
	{
		label: "Home",
		icon: "pi pi-home",
		route: { path: "/", href: "/" },
	},
	{
		label: "Years",
		route: { path: "/years", href: "/years" },
	},
	{
		label: "Corps",
		route: { path: "/corps", href: "/corps" },
	},
	{
		label: "Unknowns",
		route: { path: "/unknowns", href: "/unknowns" },
	},
	{
		label: "Recents",
		route: { path: "/recents", href: "/recents" },
	},
	{
		label: "Random",
		route: { path: "/random", href: "/random" },
	},
	{
		label: "Config",
		icon: "oi oi-gear",
		route: { path: "/config", href: "/config" },
	},
]);
</script>

<template>
  <Menubar :model="items">
        <template #item="{ item, props, hasSubmenu }">
          <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
            <a v-ripple :href="href" v-bind="props.action" @click="navigate">
              <span :class="item.icon" />
              <span>{{ item.label }}</span>
            </a>
          </router-link>
          <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
            <span :class="item.icon" />
            <span>{{ item.label }}</span>
            <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down" />
          </a>
        </template>
      </Menubar>
  <Breadcrumb :home="home" :model="history">
        <template #item="{ item, props }">         

          <router-link v-if="item.route.href" v-slot="{ href, navigate }" :to="item.route.href" custom>
            <a :href="href" v-bind="props.action" @click="navigate">
              <span :class="[item.icon, 'text-color']" />
              <span class="text-primary font-semibold">{{ item.name }}</span>
            </a>
          </router-link>
          <a v-else :href="item.url" :target="item.target" v-bind="props.action">
            <!-- B {{  item  }} -->
            <span class="text-surface-700 dark:text-surface-0">{{
              item.name
              }}</span>
          </a>
        </template>
      </Breadcrumb>
  <!-- style="height: 100%" -->
  <NuxtPage />
</template>
