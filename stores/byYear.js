export const useByYearsStore = defineStore("byYears", {
	/*
year => {
  corpsId => {
    corpsname
    history
    score
    place
    shows => [{
      (info from files table)
      }]
    }
  }
*/
	state: () => ({
		data: {},
	}),

	/*
year => {
  corpsId => {
    corpsname
    history
    score
    place
    shows => [{
      (info from files table)
      }]
    }
  }
*/
	actions: {
		load(yearsData) {
			this.data = yearsData;
		},
		getYears() {
			return Object.keys(this.data).sort().reverse();
		},
		getYear(y) {
			// biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
			if (this.data.hasOwnProperty(y)) {
				const a = [];
				for (const oneCorpsId in this.data[y]) {
					this.data[y][oneCorpsId].videoCnt =
						this.data[y][oneCorpsId].shows.length;
					a.push(this.data[y][oneCorpsId]);
				}

				// a.sort( (a,b)=>{
				// 	if( a.division === b.division) {
				// 		return b.position - a.position;
				// 	}
				// 	return a.division > b.division ? 1: -1;
				// })

				return a;
			}
			return null;
		},
		getCorpsShowsFromYear(y, cId) {
			// biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
			if (this.data.hasOwnProperty(y)) {
				// biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
				if (this.data[y].hasOwnProperty(cId)) {
					return this.data[y][cId].shows;
					// biome-ignore lint/style/noUselessElse: <explanation>
				} else {
					console.log("corps not found:", cId);
				}
			} else {
				console.log("year not found:", y);
				console.log(this.data);
			}
			return null;
		},
	},
});
