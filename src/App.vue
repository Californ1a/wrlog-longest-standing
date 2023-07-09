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
html,
body,
#app {
	min-height: 100vh;
}

body {
	background-color: #2c2d30;
	color: #eee;
	font-family: sans-serif;
	margin: 0;
}

#app {
	display: flex;
	flex-direction: column;
}

#app main {
	flex: 1 0 auto;
}

#app footer {
	flex-shrink: 0;
}
</style>
