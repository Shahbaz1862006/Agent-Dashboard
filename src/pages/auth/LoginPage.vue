<template>
  <div class="min-h-screen bg-background text-foreground flex items-center justify-center p-5">
    <div class="fixed right-4 top-4">
      <ThemeToggle />
    </div>

    <Card class="w-full max-w-md">
      <CardHeader>
        <div class="flex flex-col items-center text-center">
          <Logo logoOnly class="justify-center" />
          <div class="mt-4">
            <CardTitle>Sign in</CardTitle>
            <p class="mt-1 text-sm text-muted-foreground">Access is invite-only. Use your agent credentials.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form class="space-y-3" @submit.prevent="onSubmit">
          <div>
            <label class="text-xs text-muted-foreground">Email</label>
            <Input v-model="email" placeholder="agent@company.com" />
            <p v-if="errors.email" class="mt-1 text-xs text-destructive">{{ errors.email }}</p>
          </div>
          <div>
            <label class="text-xs text-muted-foreground">Password</label>
            <Input v-model="password" type="password" placeholder="••••••••" />
            <p v-if="errors.password" class="mt-1 text-xs text-destructive">{{ errors.password }}</p>
          </div>

          <Button type="submit" variant="primary" class="w-full" :disabled="isSubmitting">
            Sign in
          </Button>

          <div class="text-xs text-muted-foreground text-center">
            Don't have an account? <router-link to="/register" class="underline">Register</router-link>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { z } from "zod";
import Card from "../../components/ui/Card.vue";
import CardHeader from "../../components/ui/CardHeader.vue";
import CardTitle from "../../components/ui/CardTitle.vue";
import CardContent from "../../components/ui/CardContent.vue";
import Input from "../../components/ui/Input.vue";
import Button from "../../components/ui/Button.vue";
import Logo from "../../components/common/Logo.vue";
import ThemeToggle from "../../components/common/ThemeToggle.vue";
import { useAuthStore } from "../../stores/auth";
import { useToastStore } from "../../stores/toast";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Invalid Password"),
});

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const toast = useToastStore();

const email = ref("");
const password = ref("");
const isSubmitting = ref(false);
const errors = reactive<{ email?: string; password?: string }>({});

const onSubmit = async () => {
  errors.email = undefined;
  errors.password = undefined;
  const result = schema.safeParse({ email: email.value, password: password.value });
  if (!result.success) {
    const e = result.error.flatten().fieldErrors;
    if (e.email) errors.email = e.email[0];
    if (e.password) errors.password = e.password[0];
    return;
  }

  isSubmitting.value = true;
  try {
    await auth.login({ email: result.data.email, password: result.data.password });
    toast.push({ title: "Signed in", message: "Welcome back.", tone: "success" });
    const redirect = (route.query.redirect as string) || "/dashboard/home";
    router.replace(redirect);
  } catch (e) {
    errors.password = "Invalid Password";
    toast.push({ title: "Sign in failed", message: (e as Error)?.message ?? "Email or password is incorrect.", tone: "warning" });
  } finally {
    isSubmitting.value = false;
  }
};
</script>
