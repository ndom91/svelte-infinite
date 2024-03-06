<script lang="ts">
  import { type Snippet } from "svelte"
  import "../global.css"

  const { children } = $props<{ children: Snippet }>()
</script>

{@render children()}
