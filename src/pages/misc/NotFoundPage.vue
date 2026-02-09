<template>
  <div class="min-h-screen bg-background text-foreground flex items-center justify-center p-5">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>Page not found</CardTitle>
        <p class="mt-1 text-sm text-muted-foreground">The route you requested does not exist.</p>
      </CardHeader>
      <CardContent class="flex gap-2">
        <router-link to="/dashboard/home">
          <Button variant="secondary">Go to dashboard</Button>
        </router-link>
        <router-link to="/auth/login">
          <Button variant="ghost">Sign in</Button>
        </router-link>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Card from "../../components/ui/Card.vue";
import CardHeader from "../../components/ui/CardHeader.vue";
import CardTitle from "../../components/ui/CardTitle.vue";
import CardContent from "../../components/ui/CardContent.vue";
import Button from "../../components/ui/Button.vue";
</script>
