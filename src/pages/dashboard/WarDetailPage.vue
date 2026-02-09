<template>
  <div class="space-y-6">
    <template v-if="loading">Loading…</template>
    <template v-else-if="error || !warData">
      <Card><CardContent class="p-5">War not found.</CardContent></Card>
    </template>
    <template v-else-if="warData">
      <div>
        <h1 class="text-lg font-semibold">{{ warData.name }}</h1>
        <p class="mt-1 text-sm text-muted-foreground">{{ warData.opponent }} • {{ warData.status }}</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent>
          <div>Score: {{ warData.scoreYou }} – {{ warData.scoreThem }}</div>
          <div>Entry fee: {{ fmtUSDT(warData.entryFee) }}</div>
          <BaseStatusBadge :status="warData.registered ? 'Registered' : 'Not registered'" />
        </CardContent>
      </Card>
      <Button variant="secondary" @click="router.push('/dashboard/clan/wars')">Back</Button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import Card from "../../components/ui/Card.vue";
import CardHeader from "../../components/ui/CardHeader.vue";
import CardTitle from "../../components/ui/CardTitle.vue";
import CardContent from "../../components/ui/CardContent.vue";
import Button from "../../components/ui/Button.vue";
import BaseStatusBadge from "../../components/ui/BaseStatusBadge.vue";
import { useAsync } from "../../composables/useAsync";
import { api } from "../../services/client";
import { fmtUSDT } from "../../utils/format";

const route = useRoute();
const router = useRouter();
const warId = computed(() => route.params.warId as string);
const q = useAsync(() => api.getWars().then((list) => list.find((w) => w.id === warId.value) ?? null), [warId]);
const loading = q.loading;
const error = q.error;
const warData = computed(() => q.data?.value ?? null);
</script>
