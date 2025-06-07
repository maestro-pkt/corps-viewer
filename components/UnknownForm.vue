<script setup lang="js">
import { Form } from "@primevue/forms";

import { reactive } from "vue";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";
import * as corpsList from "../data/corpsList.json";

console.log(corpsList);

const props = defineProps(["record"]);

const yearList = [];
for (let i = 1973; i <= new Date().getFullYear(); i++) {
	yearList.push(i);
}
yearList.reverse();

const initialValues = reactive({
	//details: "",
	dateAdded: new Date().toISOString().substr(0, 10),
	apath: props.record?.path,
	corpsId: "",
	year: "",
});

const resolver = zodResolver(
	z.object({
		details: z
			.string()
			.min(1, { message: "Details is required via Form Resolver." }),
	}),
);

const zodCorpsIdResolver = zodResolver(
	z.number({ required_error: "Corps ID is required." }),
);

const zodYearResolver = zodResolver(
	z.number({ required_error: "Year is required." }).min(1973),
);

// const zodDateResolver = zodResolver(
// 	z.string().date().required("Date added is required."),
// );

// const valibotLastNameResolver = valibotResolver(
// 	v.pipe(v.string(), v.minLength(1, "Last name is required via Valibot.")),
// );

// const customPasswordResolver = ({ value }) => {
// 	const errors = [];

// 	if (!value) {
// 		errors.push({ message: "Password is required via Custom." });
// 	}

// 	return {
// 		errors,
// 	};
// };

const onFormSubmit = (e) => {
	// e.originalEvent: Represents the native form submit event.
	// e.valid: A boolean that indicates whether the form is valid or not.
	// e.states: Contains the current state of each form field, including validity status.
	// e.errors: An object that holds any validation errors for the invalid fields in the form.
	// e.values: An object containing the current values of all form fields.
	// e.reset: A function that resets the form to its initial state.
	console.log("Form submit");
	console.log(e.values);
	console.log(
		selectedCorpsId.value,
		selectedYear.value,
		selectedDateAdded.value,
	);
	console.log(
		props.record.key,
		props.record.filename,
		props.record.dateAdded,
		props.record.path,
	);
	// if (e.valid) {
	// 	toast.add({
	// 		severity: "success",
	// 		summary: "Form is submitted.",
	// 		life: 3000,
	// 	});
	// } else {
	// 	toast.add({
	// 		severity: "error",
	// 		summary: "Form is invalid.",
	// 		life: 3000,
	// 	});
	// }
};

const selectedCorpsId = ref("");
const selectedYear = ref("");
const selectedDateAdded = ref("");
</script>

<template>
  <div>
    <p>Key: {{ props }}</p>
    <br />
    <pre>
✓ corpsId
✓ corps dropdown that populates the corpsId
✓ year dropdown
path comes from record.path
unknown key comes from record.key
dateAdded comes from record.dateAdded 
       if it exists, if not use today
filename comes from record.filename

title text
duration (detect if possible from videojs)
resolution (detect if possible from videojs)
filetype ??
fileinfo ??
</pre
    >
  </div>

  <div class="card flex justify-center">
    <Form
      :initialValues
      :resolver
      @submit="onFormSubmit"
      class="flex flex-col gap-4 w-full sm:w-80"
    >
      <FormField
        v-slot="$field"
        name="corpsId"
        initialValue=""
        :resolver="zodCorpsIdResolver"
        class="flex flex-col gap-1"
      >
      <FloatLabel variant="on">

        <Select
          id="corpsId"
          filter 
          v-model="selectedCorpsId"
          :options="corpsList.default"
          optionLabel="name"
          optionValue="corpsId"
          placeholder="Corps"
          class="w-full md:w-56"
        >
        <template #value="slotProps">
                <div v-if="slotProps.value" class="flex items-center">
                    <!-- <img :alt="slotProps.value" src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png" :class="`mr-2 flag flag-${slotProps.value.toLowerCase()}`" style="width: 18px" /> -->
                    <div>{{ slotProps.value }}</div>
                    {{ slotProps }}
                </div>
                <span v-else>
                    {{ slotProps.placeholder }}
                </span>
            </template>
            <template #option="slotProps">
                <div class="flex items-center">
                    <!-- <img :alt="slotProps.option" src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png" :class="`mr-2 flag flag-${slotProps.option.toLowerCase()}`" style="width: 18px" /> -->
                    <div>{{ slotProps.option.name }}</div>
                </div>
            </template>
        </Select>
        <label for="corpsId">Corps</label>
        </FloatLabel>
        <Message
          v-if="$field?.invalid"
          severity="error"
          size="small"
          variant="simple"
          >{{ $field.error?.message }}</Message
        >
      </FormField>

      <FormField
        v-slot="$field"
        name="year"
        initialValue=""
        :resolver="zodYearResolver"
        class="flex flex-col gap-1"
      >
      <FloatLabel variant="on">
        <Select
        id="corpsYear"
          v-model="selectedYear"
          :options="yearList"          
          class="w-full md:w-56"
        />
        <label for="corpsYear">Year</label>
        <Message
          v-if="$field?.invalid"
          severity="error"
          size="small"
          variant="simple"
          >{{ $field.error?.message }}</Message
        >
      </FloatLabel>
      </FormField>

      <!-- <FormField
        v-slot="$field"
        name="firstname"
        initialValue=""
        :resolver="yupFirstNameResolver"
        class="flex flex-col gap-1"
      >
        <InputText type="text" placeholder="First Name" />
        <Message
          v-if="$field?.invalid"
          severity="error"
          size="small"
          variant="simple"
          >{{ $field.error?.message }}</Message
        >
      </FormField>
      <FormField
        v-slot="$field"
        name="lastname"
        initialValue=""
        :resolver="valibotLastNameResolver"
        class="flex flex-col gap-1"
      >
        <InputText type="text" placeholder="Last Name" />
        <Message
          v-if="$field?.invalid"
          severity="error"
          size="small"
          variant="simple"
          >{{ $field.error?.message }}</Message
        >
      </FormField>
      <FormField
        v-slot="$field"
        name="password"
        initialValue=""
        :resolver="customPasswordResolver"
        class="flex flex-col gap-1"
      >
        <Password
          type="text"
          placeholder="Password"
          :feedback="false"
          toggleMask
          fluid
        />
        <Message
          v-if="$field?.invalid"
          severity="error"
          size="small"
          variant="simple"
          >{{ $field.error?.message }}</Message
        >
      </FormField>
      <FormField v-slot="$field" name="details" class="flex flex-col gap-1">
        <Textarea placeholder="Details" />
        <Message
          v-if="$field?.invalid"
          severity="error"
          size="small"
          variant="simple"
          >{{ $field.error?.message }}</Message
        >
      </FormField> -->

      <FormField
        v-slot="$field"
        name="dateAdded"
               initialValue=""

        class="flex flex-col gap-1"
      >
      <FloatLabel variant="on">
        <DatePicker id="dateAdded" name="dateAdded" fluid v-model="selectedDateAdded" />
        <Message
          v-if="$field.dateAdded?.invalid"
          severity="error"
          size="small"
          variant="simple"
          >{{ $field.dateAdded.error?.message }}</Message
        >
        <label for="dateAdded">Date Added</label>
      </FloatLabel>
      </FormField>

      <!-- <FormField
        v-slot="$field"
        name="apath"
               initialValue=""

        class="flex flex-col gap-1"
      >
        <InputText
          name="apath"
          type="text"
          placeholder="Path"
          v-model="selectedPath"
        />
        <Message
          v-if="$field?.invalid"
          severity="error"
          size="small"
          variant="simple"
          >{{ $field.error?.message }}</Message
        >
      </FormField> -->

      {{ props.record?.key }}
      {{ props.record?.filename }}
      {{ props.record?.dateAdded }}
      {{ props.record?.path }}

      <Button type="submit" severity="secondary" label="Submit" />
    </Form>
  </div>
</template>
