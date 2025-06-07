export const useCorpsStore = defineStore("corps", {
	persist: true,
	state: () => ({
		name: "",
		corpsId: "",
		year: "",
		position: "",
		score: "",
		title: "",
		rep: [],
		tags: ["cool beans", "loud"],
		rating: 0,
	}),

	actions: {
		// add(route) {
		// 	console.log(route);
		// 	console.log(this.history);
		// 	if (this.history.length > this.depth) {
		// 		this.history.shift();
		// 	}
		// 	this.history.push(route);
		// 	console.log(this.history);
		// },
	},
});
