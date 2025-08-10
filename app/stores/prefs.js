export const usePrefsStore = defineStore("prefs", {
	persist: true,
	state: () => ({
		volume: "30",
		mute: false,
		autoplay: true,
		skip10: false,
		skip30: false,
	}),

	actions: {
		volUp() {
			this.volume++;
		},
		volDown() {
			this.volume--;
		},
		toggleMute() {
			this.mute = !this.mute;
		},
		skip10Sec() {
			this.skip10 = true;
			this.skip30 = false; // Ensure only one skip option is active
		},
		skip30Sec() {
			this.skip30 = true;
			this.skip10 = false; // Ensure only one skip option is active
		},
	},
});
