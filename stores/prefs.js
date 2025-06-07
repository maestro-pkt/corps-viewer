export const usePrefsStore = defineStore("prefs", {
	persist: true,
	state: () => ({
		volume: "30",
		mute: false,
		autoplay: true,
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
	},
});
