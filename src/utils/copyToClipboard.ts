import { useToastStore } from "../stores/toast";

/**
 * Copy text to clipboard and show toast. Use for "Copy ID", "Copy code", etc.
 */
export async function copyToClipboard(
  value: string,
  successTitle = "Copied",
  toastStore?: ReturnType<typeof useToastStore>
): Promise<boolean> {
  const toast = toastStore ?? useToastStore();
  try {
    await navigator.clipboard.writeText(value);
    toast.push({ title: successTitle, message: "Copied to clipboard.", tone: "success" });
    return true;
  } catch {
    toast.push({ title: "Copy failed", message: "Please copy manually.", tone: "danger" });
    return false;
  }
}
