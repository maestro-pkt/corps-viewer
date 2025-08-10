export const useCrumbStore = defineStore("crumb", {
	state: () => ({
		history: [],
		depth: 5,
	}),

	actions: {
		add(crumb) {
			console.log(
				"=================================================================",
			);
			console.log("history:");
			console.log(crumb);
			console.log(this.history);
			console.log(!!this.history);
			console.log(typeof this.history === "object");
			console.log(Array.isArray(this.history));
			console.log(this.history.constructor.name === "Proxy");
			console.log(this.history.constructor.name);

			const idx = this.history.findIndex(
				(h) => h.route.fullPath === crumb.route.fullPath,
			);

			if (idx !== -1) {
				console.log("route already exists in breadcrumbs");
			} else {
				if (this.history.length >= this.depth) {
					console.log("popping oldest crumb");
					this.history.shift();
				}
				this.history.push(crumb);
			}
		},
	},
});
