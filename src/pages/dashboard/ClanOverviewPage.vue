<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-lg font-semibold">Clan Overview</h1>
      <p class="mt-1 text-sm text-muted-foreground">Clan hub, goals, and wars.</p>
    </div>
    <Card>
      <CardHeader><CardTitle>Clan</CardTitle></CardHeader>
      <CardContent>
        <Button variant="secondary" @click="router.push('/dashboard/clan/goals')">Clan Goals</Button>
        <Button class="ml-2" variant="secondary" @click="router.push('/dashboard/clan/wars')">Clan Wars</Button>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import Card from "../../components/ui/Card.vue";
import CardHeader from "../../components/ui/CardHeader.vue";
import CardTitle from "../../components/ui/CardTitle.vue";
import CardContent from "../../components/ui/CardContent.vue";
import Button from "../../components/ui/Button.vue";

const router = useRouter();
</script>
