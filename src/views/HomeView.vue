<template>
	<main>
		<h1>Longest-Standing Distance Records</h1>
		<p>
			These are the longest-standing records for each map and mode. The records are sorted by how long they have been standing, with the longest-standing record at the top.
		</p>
		<div>
			<button :disabled="page === 1" @click="page--">Previous</button>
			<button :disabled="page === totalPages" @click="page++">Next</button>
			<span>Page {{ page }} of {{ totalPages }}</span>
			<br />
			<span>(Showing {{ displayStart }}-{{ displayEnd }} of {{ displayTotal }})</span>
		</div>
		<table>
			<thead>
				<tr>
					<th></th>
					<th>Map</th>
					<th>Mode</th>
					<th>Author</th>
					<th>Time/Score</th>
					<th>WR Holder</th>
					<th>Standing For</th>
				</tr>
			</thead>
			<tbody>
				<RecordLine v-for="record in displayRows" :record="record" :key="record.id" />
			</tbody>
		</table>
	</main>
</template>

<script setup>
import { ref, computed } from 'vue';
import RecordLine from '@/components/RecordLine.vue';
const page = ref(1);
let records;
try {
	const res = await fetch(
		import.meta.env.BASE_URL + 'output.json');
	console.log('res', res);
	records = await res.json();
	console.log('records', records);
} catch (err) {
	console.error(err);
}

const perPage = 100;
const totalPages = Math.ceil(records.length / perPage);
const totalRecords = records.length;

const displayStart = computed(() => ((page.value - 1) * perPage + 1).toLocaleString());
const displayEnd = computed(() => Math.min(page.value * perPage, totalRecords).toLocaleString());
const displayTotal = computed(() => totalRecords.toLocaleString());

const displayRows = computed(() => {
	const start = (page.value - 1) * perPage;
	const end = page.value * perPage;
	return records.slice(start, end);
});
</script>

<style scoped>
table {
	border-collapse: collapse;
	width: 100%;
	background-color: #323337;
}

th {
	position: sticky;
	top: 0;
	background-color: #000000bb;
	color: #eee;
	padding: 10px;
}

tbody tr td:nth-child(2) {
	max-width: 35vw;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

tbody tr:nth-child(even) {
	background-color: #202122;
}

tbody tr:hover {
	background-color: rgba(255, 255, 255, 0.1);
}

tbody tr:nth-child(even):hover {
	background-color: rgba(255, 255, 255, 0.15);
}

tbody tr.official {
	background-color: #3498db33;
}

tbody tr.official:hover {
	background-color: rgba(0, 150, 255, 0.25);
}
</style>
