<template>
	<main>
		<h1>Longest-Standing Distance Records</h1>
		<p>
			These are the longest-standing records for each map and mode. The records are sorted by how long they have been standing, with the longest-standing record at the top.
		</p>
		<p class="note">
			Note that some records are on maps that are no longer on the workshop, thus they can't be beaten anymore. Additionally, some are on maps that still exist on the workshop but are no longer possible to beat due to the author updating the map after the record was obtained.
		</p>
		<div class="controls">
			<div class="pagination">
				<!-- <button :disabled="page === 1" @click="page--">Previous</button>
				<button :disabled="page === totalPages" @click="page++">Next</button> -->
				<span>Page <input v-model.lazy="page" type="number" /> of {{ totalPages }}</span>
				<br />
				<span>Showing {{ displayStart }}-{{ displayEnd }} of {{ displayTotal }}</span>
			</div>
			<div class="search">
				<input type="text" placeholder="Search..." ref="search" @input="processChange" />
			</div>
		</div>
		<table>
			<thead>
				<tr>
					<th colspan="2">Map</th>
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
const search = ref(null);
const page = ref(1);
const recordsRef = ref([]);
const maxPerPage = 100;

let records

try {
	const res = await fetch(
		import.meta.env.BASE_URL + 'output.json');
	records = await res.json();
	recordsRef.value = records;
} catch (err) {
	console.error(err);
}

function debounce(func, timeout = 300) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			func.apply(this, args);
		}, timeout);
	};
}

function doSearch() {
	page.value = 1;
	recordsRef.value = records.filter(record => {
		const searchLower = search.value.value.toLowerCase();
		return record.map_name.toLowerCase().includes(searchLower)
			|| (record.author && record.author !== '[unknown]' && record.author.toLowerCase().includes(searchLower))
			|| record.new_recordholder.toLowerCase().includes(searchLower)
			|| (record.steam_id_author && record.steam_id_author.includes(searchLower))
			|| record.steam_id_new_recordholder.includes(searchLower);
	});
}
const processChange = debounce(() => doSearch());

const perPage = computed(() => Math.min(maxPerPage, recordsRef.value.length) || 1);
const totalPages = computed(() => Math.ceil(recordsRef.value.length / perPage.value) || 1);
const totalRecords = computed(() => recordsRef.value.length || 0);

const displayStart = computed(() => (totalRecords.value === 0) ? 0 : ((page.value - 1) * perPage.value + 1).toLocaleString());
const displayEnd = computed(() => Math.min(page.value * perPage.value, totalRecords.value).toLocaleString());
const displayTotal = computed(() => totalRecords.value.toLocaleString());

const displayRows = computed(() => {
	const start = (page.value - 1) * perPage.value;
	const end = page.value * perPage.value;
	return recordsRef.value.slice(start, end);
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

.controls {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 5px;
	margin-right: 10px;
}

.search input {
	line-height: 30px;
	font-size: 16pt;
	width: 100%;
	background-color: #111;
	color: #fff;
	border: none;
	border-radius: 5px;
	padding: 5px;
}

.search input:focus {
	outline: none;
}

.pagination {
	line-height: 20px;
}

.pagination span:nth-child(1) {
	line-height: 35px;
}

.pagination input {
	width: 40px;
	background-color: #111;
	color: #fff;
	border: none;
	border-radius: 5px;
	padding: 5px;
}

.pagination input:focus {
	outline: none;
}

p.note {
	font-size: 0.85rem;
	color: #ccc;
}
</style>
