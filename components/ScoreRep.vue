<template>
  <div>
    <Panel header="Finals Placement" v-if="props.score !== null">
      <p class="text-gray-700">
        Place {{ props.position + getOrdinalSuffix(Number.parseInt(props.position)) }}
      </p>
      <p class="text-gray-700">Score {{ props.score }}</p>

    </Panel>
    <hr class="mb-2 mt-2" />
    <Panel :header="props.title">
      <ul class="list-disc list-inside" v-for="one in repArray">
        <li class="text-gray-700">{{ one }}</li>
      </ul>
    </Panel>
    <hr class="mb-2 mt-2" />
  </div>
</template>

<script lang="js" setup>
const props = defineProps({
  position: {
    type: [String, Number],
    required: true,
    default() {
      return 0;
    },
  },
  score: {
    type: [String, Number],
    required: true,
    default() {
      return 0.0;
    },
  },
  title: {
    type: String,
    required: true,
    default() {
      return "Repertoire";
    },
  },
  rep: {
    type: String,
    required: true,
    default() {
      return "";
    },
  },
});


const repArray = ref([]);

watch(() => props.rep, (newRep) => {
  console.log("rep changed:", newRep);

  if (newRep.length) {
    repArray.value = newRep.split("~!~");
    console.log("repArray:", repArray.value);
  } else {
    repArray.value.push("Something wrong with rep");
  }
}, { immediate: true });



const suffixes = ["th", "st", "nd", "rd"];

function getOrdinalSuffix(number) {
  // console.log("getOrdinalSuffix", number, Number.isNaN(number));
  if (number !== null && !Number.isNaN(number)) {
    // Get ones digit of number
    const onesDigit = number % 10;

    // Handle special cases for 11, 12, 13
    if (number % 100 >= 11 && number % 100 <= 13) {
      return "th";
    }

    // Pick suffix from array based on ones digit
    return onesDigit < 4 ? suffixes[onesDigit] : suffixes[0];
  }
  return "";
}
</script>

<style></style>