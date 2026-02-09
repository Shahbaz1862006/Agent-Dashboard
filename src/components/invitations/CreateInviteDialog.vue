<template>
  <Modal
    :open="open"
    title="Create invite"
    :on-close="onClose"
    width-class="max-w-md"
  >
    <p class="text-xs text-muted-foreground mb-4">Invite Expiry: {{ INVITATION_EXPIRY_DAYS }} days.</p>

    <div class="space-y-5">
      <!-- Name (grouped) -->
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label for="create-first-name" class="block text-sm font-medium text-foreground">First name <span class="text-destructive" aria-hidden="true">*</span></label>
          <Input id="create-first-name" v-model="firstName" placeholder="First name" class="h-10" aria-required="true" :aria-invalid="!!errors.firstName" :aria-errormessage="errors.firstName ? 'create-first-name-err' : undefined" />
          <p v-if="errors.firstName" id="create-first-name-err" class="text-xs text-destructive" role="alert">{{ errors.firstName }}</p>
        </div>
        <div class="space-y-1.5">
          <label for="create-last-name" class="block text-sm font-medium text-foreground">Last name <span class="text-destructive" aria-hidden="true">*</span></label>
          <Input id="create-last-name" v-model="lastName" placeholder="Last name" class="h-10" aria-required="true" :aria-invalid="!!errors.lastName" :aria-errormessage="errors.lastName ? 'create-last-name-err' : undefined" />
          <p v-if="errors.lastName" id="create-last-name-err" class="text-xs text-destructive" role="alert">{{ errors.lastName }}</p>
        </div>
      </div>

      <!-- Method selection: selectable chips (multi-select) -->
      <fieldset class="space-y-2">
        <legend class="text-sm font-medium text-foreground">Invitation method(s) <span class="text-destructive" aria-hidden="true">*</span></legend>
        <div class="flex flex-wrap gap-2" role="group" :aria-describedby="errors.methods ? 'create-methods-err' : undefined">
          <button
            v-for="method in INVITATION_METHODS"
            :key="method"
            type="button"
            class="inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            :class="selectedMethods.includes(method)
              ? 'border-primary bg-primary/10 text-foreground'
              : 'border-border bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground'"
            @click="toggleMethod(method)"
          >
            {{ INVITATION_METHOD_LABELS[method] }}
          </button>
        </div>
        <p v-if="errors.methods" id="create-methods-err" class="text-xs text-destructive" role="alert">{{ errors.methods }}</p>
      </fieldset>

      <!-- Contact fields only for selected methods (progressive disclosure) -->
      <template v-for="method in INVITATION_METHODS" :key="method">
        <div v-if="selectedMethods.includes(method)" class="space-y-1.5">
          <label :for="`create-${method}`" class="block text-sm font-medium text-foreground">{{ INVITATION_METHOD_LABELS[method] }} <span class="text-destructive" aria-hidden="true">*</span></label>
          <Input
            :id="`create-${method}`"
            v-model="contactValues[method]"
            :placeholder="INVITATION_METHOD_PLACEHOLDERS[method]"
            class="h-10"
            :type="method === 'EMAIL' ? 'email' : 'text'"
            :aria-required="true"
            :aria-invalid="!!errors[method.toLowerCase()]"
            :aria-errormessage="errors[method.toLowerCase()] ? `create-${method}-err` : undefined"
          />
          <p v-if="errors[method.toLowerCase()]" :id="`create-${method}-err`" class="text-xs text-destructive" role="alert">{{ errors[method.toLowerCase()] }}</p>
        </div>
      </template>
    </div>

    <div class="flex justify-end gap-2 pt-4 border-t border-border/60 mt-4">
      <Button variant="ghost" type="button" @click="onClose">Cancel</Button>
      <Button variant="primary" type="button" :disabled="loading" :aria-busy="loading" @click="onSubmit">
        {{ loading ? "Creating…" : "Continue" }}
      </Button>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import type { CreateInvitationPayload, InvitationMethod } from "../../types";
import Button from "../ui/Button.vue";
import Input from "../ui/Input.vue";
import Modal from "../ui/Modal.vue";
import {
  INVITATION_EXPIRY_DAYS,
  INVITATION_METHODS,
  INVITATION_METHOD_LABELS,
  INVITATION_METHOD_PLACEHOLDERS,
} from "../../constants/invitations";
import { validateInvitationForm } from "../../utils/invitationValidation";

const props = withDefaults(
  defineProps<{ open: boolean; loading?: boolean }>(),
  { loading: false }
);
const emit = defineEmits<{ close: []; submit: [payload: Omit<CreateInvitationPayload, "invitationCode">] }>();

const firstName = ref("");
const lastName = ref("");
const selectedMethods = ref<InvitationMethod[]>([]);
const contactValues = reactive<Record<InvitationMethod, string>>({
  EMAIL: "",
  WHATSAPP: "",
  PHONE: "",
  TELEGRAM: "",
});
const errors = ref<Record<string, string>>({});

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      firstName.value = "";
      lastName.value = "";
      selectedMethods.value = [];
      contactValues.EMAIL = "";
      contactValues.WHATSAPP = "";
      contactValues.PHONE = "";
      contactValues.TELEGRAM = "";
      errors.value = {};
    }
  }
);

function onClose() {
  emit("close");
}

function toggleMethod(method: InvitationMethod) {
  const idx = selectedMethods.value.indexOf(method);
  if (idx === -1) selectedMethods.value = [...selectedMethods.value, method];
  else selectedMethods.value = selectedMethods.value.filter((m) => m !== method);
}

function onSubmit() {
  const payload: Omit<CreateInvitationPayload, "invitationCode"> = {
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    contacts: selectedMethods.value.map((method) => ({
      method,
      value: contactValues[method]?.trim() ?? "",
    })),
  };
  const err = validateInvitationForm(
    firstName.value,
    lastName.value,
    selectedMethods.value,
    contactValues
  );
  if (Object.keys(err).length > 0) {
    errors.value = err;
    return;
  }
  errors.value = {};
  emit("submit", payload);
}
</script>
