<template>
	<GithubCorner />
	<Suspense>
		<RouterView />

		<template #fallback>
			<div>Loading...</div>
		</template>
	</Suspense>
</template>

<script setup>
import { RouterView } from 'vue-router'
import GithubCorner from '@/components/GithubCorner.vue'
</script>

<style>
body {
	background-color: #2c2d30;
	color: #eee;
	font-family: sans-serif;
}
</style>
