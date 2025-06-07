/*

app creates this ServiceWorker
it registers listener

then logs url changes (on this site) into a store


then component pulls from the store and shows breadcrumbs

*/

const previousURL = document.referrer;

const isPreviousURLExternal =
	new URL(previousURL).origin == new URL(location).origin;
console.log(isPreviousURLExternal);

//To capture URLs as the user navigates, consider setting up event listeners that track history state changes.

window.addEventListener("popstate", (event) => {
	console.log(
		"Previous URL:",
		event.state?.previousURL || "No previous URL saved",
	);
});

// 1. Navigation Guards (beforeEach, beforeResolve, afterEach):

import { useRouter } from "vue-router";

const router = useRouter();

router.beforeEach((to, from, next) => {
	// Do something before navigation happens
	console.log("Route changing from:", from.path, "to:", to.path);
	next(); // Allow navigation to continue
});
