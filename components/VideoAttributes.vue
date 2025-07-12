<template>
	<div>


		<Panel header="Video Attributes">
			<div class="card flex flex-wrap justify-center gap-4">
				<!-- {{ attributes }}
        <hr />++++++++++++++++++++++++++++<br />
        
          {{  attribs }}
          <hr/>++++++++++++++++++++++++++++<br/>  -->


				<div v-for="oneAttrib of attribs" :key="oneAttrib.key" class="flex items-center gap-2">
					<!--  @update:modelValue="checkChange"  -->
					<Checkbox v-model="attributes" :inputId="oneAttrib.key" name="attribute" :value="oneAttrib.name" />
					<label :for="oneAttrib.key">{{ oneAttrib.name }}</label>
				</div>
			</div>
			<p class="text-gray-700">Views: {{ viewCntr }}</p>
		</Panel>
		<hr class="mb-2 mt-2" />
		<Panel header="Tags">
			<AutoComplete v-model="tags" inputId="multiple-ac-2" multiple fluid @complete="searchTags" @change="tagUpdate"
				:typeahead="false" />
			<Rating v-model="rating" @change="ratingChange" class="mt-2" />
		</Panel>
	</div>
</template>

<script lang="js" setup>
const props = defineProps({
	vidId: {
		type: String,
		required: true,
		default() {
			return "";
		},
	},
});

const tags = ref([]);
const rating = ref(0);
const viewCntr = ref(1);
const attributes = ref([""]);

const attribs = ref([
	{ key: "highCam", name: "High Cam" },
	{ key: "percussionCam", name: "Percussion Cam" },
	{ key: "guardCam", name: "Guard Cam" },
	{ key: "officialVideo", name: "Official Video" },
	{ key: "unofficialVideo", name: "Unofficial Video" },
	{ key: "finalsVideo", name: "Finals Video" },
]);

function test() {
	attributes.value.push("High Cam");
}

onMounted(async () => {
	const t = await $fetch(`/api/attributes/${props.vidId}`);
	console.log("file attributes:", t);
	if (t.length > 0) {
		console.log("t[0]:", t[0]);

		if (t[0].tag !== null) {
			tags.value = t[0].tag.split(",");
		}
		if (t[0].rating !== null) {
			rating.value = t[0].rating;
		}
		if (t[0].officialVideo === 1) {
			console.log("Official Video");
			attributes.value.push("Official Video");
		}
		if (t[0].highCam === 1) {
			attributes.value.push("High Cam");
		}
		if (t[0].percussionCam === 1) {
			attributes.value.push("Percussion Cam");
		}
		if (t[0].guardCam === 1) {
			attributes.value.push("Guard Cam");
		}
		if (t[0].finalsVideo === 1) {
			attributes.value.push("Finals Video");
		}
		if (t[0].unofficialVideo === 1) {
			attributes.value.push("Unofficial Video");
		}

		viewCntr.value = t[0]?.viewCntr ? t[0].viewCntr + 1 : 1;
		console.log(t[0]?.viewCntr);

		console.log(attributes.value);
	}

	console.log('Views: ', viewCntr.value);

	$fetch(`/api/attributes/${props.vidId}`, {
		method: "post",
		body: {
			viewCntr: viewCntr.value,
		},
	});
});

async function ratingChange(x) {
	// console.log(x.value);
	await $fetch(`/api/attributes/${props.vidId}`, {
		method: "post",
		body: { rating: x.value },
	});
}

async function tagUpdate(x) {
	// console.log("tags changed", x);
	// console.log("update db to ", x.value);

	await $fetch(`/api/attributes/${props.vidId}`, {
		method: "post",
		body: { tags: x.value },
	});
}
// Dont know why this works but it does...
const searchTags = (event) => {
	// console.log("search tags:", event.query);

	tags.value = [...Array(10).keys()].map((item) => `${event.query}-${item}`);
};

watch(attributes, (newVal, oldVal) => {
	// console.log("attributes changed", newVal, oldVal);
	if (newVal !== oldVal) {
		checkChange();
	}
});

async function checkChange() {
	const postBody = {};

	console.log("check change attributes:", attributes.value);

	// console.log("attributes changed", attributes.value);
	if (attributes.value.includes("Official Video")) {
		postBody.officialVideo = 1;
	} else {
		postBody.officialVideo = 0;
	}
	if (attributes.value.includes("High Cam")) {
		postBody.highCam = 1;
	} else {
		postBody.highCam = 0;
	}
	if (attributes.value.includes("Percussion Cam")) {
		postBody.percussionCam = 1;
	} else {
		postBody.percussionCam = 0;
	}
	if (attributes.value.includes("Guard Cam")) {
		postBody.guardCam = 1;
	} else {
		postBody.guardCam = 0;
	}
	if (attributes.value.includes("Unofficial Video")) {
		postBody.unofficialVideo = 1;
	} else {
		postBody.unofficialVideo = 0;
	}
	if (attributes.value.includes("Finals Video")) {
		postBody.finalsVideo = 1;
	} else {
		postBody.finalsVideo = 0;
	}

	console.log("postBody:", postBody);

	await $fetch(`/api/attributes/${props.vidId}`, {
		method: "post",
		body: postBody,
	});
}
</script>

<style></style>