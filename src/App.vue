<template>
	<Suspense>
		<RouterView />

		<template #fallback>
			<div>Loading...</div>
		</template>
	</Suspense>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>

<style>
body {
	background-color: #2c2d30;
	color: #eee;
	font-family: sans-serif;
}
</style>
