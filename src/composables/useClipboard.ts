import { ref } from 'vue';

export function useClipboard(timeout = 2000) {
  const copied = ref(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  async function copy(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      copied.value = true;
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        copied.value = false;
      }, timeout);
      return true;
    } catch (e) {
      console.error('Failed to copy to clipboard', e);
      return false;
    }
  }

  return {
    copied,
    copy
  };
}
