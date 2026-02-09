<template>
  <div class="min-h-screen bg-background text-foreground flex items-center justify-center p-5">
    <div class="fixed right-4 top-4">
      <ThemeToggle />
    </div>

    <Card class="w-full max-w-2xl">
      <CardHeader>
        <div class="flex flex-col items-center text-center">
          <Logo logoOnly class="justify-center" />
          <div class="mt-4">
            <CardTitle>Invite-only registration</CardTitle>
            <p class="mt-1 text-sm text-muted-foreground">
              Your account will be linked to the inviting agent clan.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form class="mt-2 space-y-4" @submit.prevent="onSubmit">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs text-muted-foreground">First Name</label>
              <Input v-model="form.firstName" placeholder="First name" />
              <p v-if="errors.firstName" class="mt-1 text-xs text-destructive">{{ errors.firstName }}</p>
            </div>
            <div>
              <label class="text-xs text-muted-foreground">Last Name</label>
              <Input v-model="form.lastName" placeholder="Last name" />
              <p v-if="errors.lastName" class="mt-1 text-xs text-destructive">{{ errors.lastName }}</p>
            </div>
          </div>

          <div>
            <label class="text-xs text-muted-foreground">Email</label>
            <Input v-model="form.email" placeholder="you@email.com" />
            <p v-if="errors.email" class="mt-1 text-xs text-destructive">{{ errors.email }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="text-xs text-muted-foreground">Country Code</label>
              <Select v-model="form.countryCode">
                <option v-for="c in COUNTRY_OPTIONS" :key="c.code" :value="c.code">{{ c.code }} — {{ c.country }}</option>
              </Select>
              <p v-if="errors.countryCode" class="mt-1 text-xs text-destructive">{{ errors.countryCode }}</p>
            </div>
            <div>
              <label class="text-xs text-muted-foreground">Phone Number</label>
              <Input v-model="form.phone" placeholder="3012345678" inputmode="numeric" />
              <p v-if="errors.phone" class="mt-1 text-xs text-destructive">{{ errors.phone }}</p>
            </div>
            <div>
              <label class="text-xs text-muted-foreground">Country</label>
              <Input v-model="form.country" readonly />
            </div>
          </div>

          <div>
            <label class="text-xs text-muted-foreground">Date of Birth</label>
            <Input v-model="form.dob" type="date" :max="todayISO" />
            <p v-if="errors.dob" class="mt-1 text-xs text-destructive">{{ errors.dob }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs text-muted-foreground">Password</label>
              <div class="relative">
                <Input v-model="form.password" :type="showPass ? 'text' : 'password'" placeholder="Create password" />
                <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" @click="showPass = !showPass" aria-label="Toggle password">
                  <IconLucide v-if="showPass" name="eye-off" class="h-4 w-4" />
                  <IconLucide v-else name="eye" class="h-4 w-4" />
                </button>
              </div>
              <p v-if="errors.password" class="mt-1 text-xs text-destructive">{{ errors.password }}</p>
            </div>
            <div>
              <label class="text-xs text-muted-foreground">Confirm Password</label>
              <div class="relative">
                <Input v-model="form.confirmPassword" :type="showConfirm ? 'text' : 'password'" placeholder="Confirm password" />
                <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" @click="showConfirm = !showConfirm" aria-label="Toggle confirm password">
                  <IconLucide v-if="showConfirm" name="eye-off" class="h-4 w-4" />
                  <IconLucide v-else name="eye" class="h-4 w-4" />
                </button>
              </div>
              <p v-if="errors.confirmPassword" class="mt-1 text-xs text-destructive">{{ errors.confirmPassword }}</p>
            </div>
          </div>

          <label class="flex items-start gap-2 text-sm">
            <input v-model="form.acceptTerms" type="checkbox" class="mt-1" />
            <span>I accept the Terms & Privacy Policy.</span>
          </label>
          <p v-if="errors.acceptTerms" class="text-xs text-destructive">{{ errors.acceptTerms }}</p>

          <Button type="submit" variant="primary" class="w-full" :disabled="isSubmitting">
            {{ isSubmitting ? "Creating…" : "Create account" }}
          </Button>

          <div class="text-xs text-muted-foreground text-center">
            Already have an account? <router-link class="underline" to="/login">Sign in</router-link>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { z } from "zod";
import IconLucide from "../../components/common/IconLucide.vue";
import Card from "../../components/ui/Card.vue";
import CardHeader from "../../components/ui/CardHeader.vue";
import CardTitle from "../../components/ui/CardTitle.vue";
import CardContent from "../../components/ui/CardContent.vue";
import Input from "../../components/ui/Input.vue";
import Select from "../../components/ui/Select.vue";
import Button from "../../components/ui/Button.vue";
import Logo from "../../components/common/Logo.vue";
import ThemeToggle from "../../components/common/ThemeToggle.vue";
import { useToastStore } from "../../stores/toast";

const LS_INVITE = "clazino_invite";
const LS_CREDS = "clazino_agent_credentials";

const COUNTRY_OPTIONS = [
  { code: "+92", country: "Pakistan" },
  { code: "+971", country: "United Arab Emirates" },
  { code: "+44", country: "United Kingdom" },
  { code: "+1", country: "United States" },
  { code: "+91", country: "India" },
  { code: "+61", country: "Australia" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+39", country: "Italy" },
  { code: "+34", country: "Spain" },
];

function calcAge(dobISO: string) {
  const dob = new Date(dobISO);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

const schema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Enter a valid email"),
    countryCode: z.string().min(1, "Country code is required"),
    phone: z.string().min(7, "Enter a valid phone number").regex(/^\d+$/, "Phone must contain digits only"),
    country: z.string().min(1),
    dob: z
      .string()
      .min(1, "Date of birth is required")
      .refine((v) => {
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return false;
        if (d.getTime() > Date.now()) return false;
        return calcAge(v) >= 18;
      }, "You must be 18+ to register"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must include an uppercase letter")
      .regex(/[0-9]/, "Password must include a number"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    acceptTerms: z.boolean().refine((v) => v === true, "You must accept the terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const router = useRouter();
const toast = useToastStore();

const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  countryCode: "+92",
  phone: "",
  country: "Pakistan",
  dob: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
});
const errors = reactive<Record<string, string>>({});
const showPass = ref(false);
const showConfirm = ref(false);
const isSubmitting = ref(false);

const todayISO = new Date().toISOString().slice(0, 10);

const inviteState = ref<{ inviteVerified: boolean; inviteMeta?: { code: string } } | null>(null);

onMounted(() => {
  try {
    const raw = localStorage.getItem(LS_INVITE);
    if (!raw) inviteState.value = null;
    else inviteState.value = JSON.parse(raw);
  } catch {
    inviteState.value = null;
  }
  if (!inviteState.value?.inviteVerified) {
    router.replace("/invite");
  }
});

watch(
  () => form.countryCode,
  (code) => {
    const found = COUNTRY_OPTIONS.find((c) => c.code === code);
    if (found) form.country = found.country;
  }
);

async function onSubmit() {
  Object.keys(errors).forEach((k) => delete errors[k]);
  const result = schema.safeParse(form);
  if (!result.success) {
    const e = result.error.flatten().fieldErrors as Record<string, string[]>;
    Object.entries(e).forEach(([k, v]) => {
      if (v && v[0]) errors[k] = v[0];
    });
    return;
  }
  if (!inviteState.value?.inviteVerified) {
    toast.push({ title: "Invite required", message: "Registration is invite-only.", tone: "warning" });
    router.replace("/invite");
    return;
  }
  isSubmitting.value = true;
  localStorage.setItem(LS_CREDS, JSON.stringify({ email: result.data.email.toLowerCase(), password: result.data.password }));
  localStorage.removeItem(LS_INVITE);
  toast.push({ title: "Account created", message: "Please sign in to continue.", tone: "success" });
  await router.replace("/login");
  isSubmitting.value = false;
}
</script>
