<script setup lang="js">
// const busy = ref(false);

async function scanFiles() {
    console.log("scanFiles");
    await navigateTo("/config/scanForNewFiles");
}


// moved inside of scanFiles
// async function buildJson() {
// 	busy.value = true;
// 	await $fetch("/api/libMaint/buildStores");
// 	busy.value = false;
// }
</script>

<template>
    <Panel title="Configuration" subtitle="Scan for new files">
        <p>Click the button below to scan for new files.</p>
        <Button label="Scan for new files" @click="scanFiles" />
        <!-- <Button label="Build Json files" @click="buildJson" /> -->

        <!-- {{ busy  }} -->
        <!-- <ProgressSpinner v-if="busy" /> -->


    </Panel>

</template>