export const useByCorpsStore = defineStore("byCorps", {
	/*
corpsId => {
  corpsname
  history
  years => {
    1980 => {
      score
      place
      rep
      shows => [{
      (info from files table)
      }]
}
    }
  }
*/
	state: () => ({
		data: {},
	}),
	/*
corpsId => {
  corpsname
  history
  years => {
    1980 => {
      score
      place
      rep
      shows => [{
      (info from files table)
      }]
}
    }
  }
*/
	actions: {
		load(corpsData) {
			this.data = corpsData;
		},
		getCorps() {
			const corpsList = Object.keys(this.data).map((cId) => {
				// console.log(cId);
				// console.log(Object.keys(this.data[cId].years));
				return {
					corpsId: cId,
					name: this.data[cId].name,
					years: Object.keys(this.data[cId].years),
					numYears: Object.keys(this.data[cId].years).length,
					//division: this.data[cId].division
				};
			});
			return corpsList;
		},
		getCorpsById(cId) {
			// biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
			if (this.data.hasOwnProperty(cId)) {
				return this.data[cId];
			}
			return null;
		},
		getCorpsByName(n) {
			const theCorps = this.data.filter((oneCorpsId) => {
				return this.data[oneCorpsId].name === n;
			});
			if (theCorps.length !== 0) {
				return theCorps[0];
			}
			return null;
		},
		getCorpsShowsFromYear(y, cId) {
			// biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
			if (this.data.hasOwnProperty(cId)) {
				// biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
				if (this.data[cId].years.hasOwnProperty(y)) {
					return this.data[cId].years[y].shows;
				}
			}
			return null;
		},
	},
});
