import { ref, watch, isRef, onMounted } from "vue";
import type { Ref } from "vue";

function runFetch<T>(
  fn: () => Promise<T>,
  data: Ref<T | null>,
  error: Ref<string | null>,
  loading: Ref<boolean>
) {
  loading.value = true;
  error.value = null;
  fn()
    .then((res) => {
      data.value = res;
    })
    .catch((e) => {
      error.value = e?.message ?? "Something went wrong";
    })
    .finally(() => {
      loading.value = false;
    });
}

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const data = ref<T | null>(null) as Ref<T | null>;
  const error = ref<string | null>(null);
  const loading = ref(true);

  if (deps.length === 0) {
    // No deps: run once on mount. Avoid watch so we never re-trigger on re-renders.
    onMounted(() => {
      runFetch(fn, data, error, loading);
    });
  } else {
    // With deps: watch dependency values and re-fetch when they change.
    watch(
      () => deps.map((d) => (isRef(d) ? d.value : d)),
      () => runFetch(fn, data, error, loading),
      { immediate: true, deep: true }
    );
  }

  const run = () => runFetch(fn, data, error, loading);
  return { data, error, loading, setData: (v: T | null) => (data.value = v), run };
}
