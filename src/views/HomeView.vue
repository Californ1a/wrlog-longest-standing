<template>
	<main>
		<h1>Longest-Standing Distance Records</h1>
		<p>
			These are the longest-standing records for each map and mode. The records are sorted by how long they have been standing, with the longest-standing record at the top.
		</p>
		<p class="note">
			Note that some records are on maps that are no longer on the workshop, thus they can't be beaten anymore. Additionally, some are on maps that still exist on the workshop but are no longer possible to beat due to the author updating the map after the record was obtained.
		</p>
		<LoadingSpinner v-if="loading && !error" />
		<div v-else-if="error">
			<p>There was an error loading the records. Please try again later.</p>
		</div>
		<div class="container" v-else-if="!loading && !error">
			<div class="controls">
				<div class="pagination">
					<!-- <button :disabled="page === 1" @click="page--">Previous</button>
				<button :disabled="page === totalPages" @click="page++">Next</button> -->
					<span>Page <input v-model.lazy="page" type="number" /> of {{ totalPages }}</span>
					<br />
					<span>Showing {{ displayStart }}-{{ displayEnd }} of {{ displayTotal }}</span>
				</div>
				<div class="filters">
					<label>
						<input type="checkbox" value="sprint" :checked="modes.includes('sprint')" @input="processMode" />
						Sprint
					</label>
					<label>
						<input type="checkbox" value="stunt" :checked="modes.includes('stunt')" @input="processMode" />
						Stunt
					</label>
					<label>
						<input type="checkbox" value="challenge" :checked="modes.includes('challenge')" @input="processMode" />
						Challenge
					</label>
				</div>
				<div class="search">
					<input type="text" placeholder="Search..." ref="search" @input="processSearch" />
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
						<th class="changed-hands" title="x/y where x denotes how many times a record has changed to a different holder and y is the total number of times the record has been beaten.">Changed Hands</th>
					</tr>
				</thead>
				<tbody>
					<RecordLine v-for="record in displayRows" :record="record" :key="record.id" />
				</tbody>
			</table>
			<div class="controls bottom">
				<div class="pagination">
					<button :disabled="page === 1" @click="page--">Previous</button>
					<button :disabled="page === totalPages" @click="page++">Next</button>
					<span>Page {{ page }} of {{ totalPages }}</span>
				</div>
			</div>
		</div>
	</main>
	<footer>
		<div class="github">
			<a href="https://github.com/Californ1a/wrlog-longest-standing" target="_blank" rel="noopener noreferrer">
				GitHub
			</a>
		</div><b>&nbsp;•&nbsp;</b>
		<div class="build-date">
			Last Updated: {{ dateRef }}
		</div><b>&nbsp;•&nbsp;</b>
		<div class="discord">
			<a href="https://discord.gg/distance" target="_blank" rel="noopener noreferrer">
				Discord
			</a>
		</div>
	</footer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from '@/stores/store';
import { storeToRefs } from 'pinia'
import RecordLine from '@/components/RecordLine.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const store = useStore();
const { records, filteredRecords } = storeToRefs(store);

const loading = ref(true);
const error = ref(null);
const buildDate = new Date(__BUILD_TIMESTAMP__);
const search = ref(null);
const page = ref(1);
const modes = ref(['sprint', 'stunt', 'challenge']);
const dtFormat = new Intl.DateTimeFormat('en', {
	year: 'numeric',
	month: 'long',
	day: 'numeric',
	hour: 'numeric',
	minute: 'numeric',
	timeZoneName: 'short',
});
const dateRef = ref(dtFormat.format(buildDate));
const maxPerPage = 100;

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
	filteredRecords.value = records.value.filter(record => {
		const searchLower = search.value.value.toLowerCase();
		return (record.map_name.toLowerCase().includes(searchLower)
			|| (record.author && record.author !== '[unknown]' && record.author.toLowerCase().includes(searchLower))
			|| record.new_recordholder.toLowerCase().includes(searchLower)
			|| (record.steam_id_author && record.steam_id_author.includes(searchLower))
			|| record.steam_id_new_recordholder.includes(searchLower)) && modes.value.includes(record.mode.toLowerCase());
	});
}

function doMode(event) {
	if (event.target.checked) {
		modes.value.push(event.target.value);
	} else {
		modes.value = modes.value.filter(mode => mode !== event.target.value);
	}
	doSearch();
}

const processSearch = debounce(() => doSearch());
const processMode = debounce((e) => doMode(e));

const perPage = computed(() => Math.min(maxPerPage, filteredRecords.value.length) || 1);
const totalPages = computed(() => Math.ceil(filteredRecords.value.length / perPage.value) || 1);
const totalRecords = computed(() => filteredRecords.value.length || 0);

const displayStart = computed(() => (totalRecords.value === 0) ? 0 : ((page.value - 1) * perPage.value + 1).toLocaleString());
const displayEnd = computed(() => Math.min(page.value * perPage.value, totalRecords.value).toLocaleString());
const displayTotal = computed(() => totalRecords.value.toLocaleString());

const displayRows = computed(() => {
	const start = (page.value - 1) * perPage.value;
	const end = page.value * perPage.value;
	return filteredRecords.value.slice(start, end);
});

onMounted(async () => {
	try {
		await store.fetchRecords();
		console.log('Records fetched', records.value.length);
	} catch (err) {
		console.error(err);
	} finally {
		loading.value = false;
	}
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
	z-index: 2;
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

main {
	margin: 15px;
}

footer {
	margin-top: 20px;
	font-size: 0.85rem;
	color: #ccc;
	display: flex;
	justify-content: space-between;
	align-items: center;
	background-color: #000000bb;
	padding: 15px 40%;
	text-align: center;
	white-space: nowrap;
	z-index: 2;
}

a {
	text-decoration: none;
	color: #0af;
}

a:hover {
	color: #0cf;
}

a:visited {
	color: #9af;
}

a:active {
	color: #0aa;
}

a:visited:hover {
	color: #bcf;
}

.controls.bottom {
	margin-top: 10px;
}

footer a {
	color: #eee;
}

footer a:hover {
	color: #fff;
}

footer a:visited {
	color: #eee;
}

footer a:active {
	color: #fff;
}

footer a:visited:hover {
	color: #fff;
}

h1 {
	margin-top: 0;
}

.controls.bottom .pagination span {
	margin-left: 5px;
}

.filters {
	margin-left: auto;
	margin-right: 10px;
	display: flex;
	flex-direction: column;
	user-select: none;
}

.filters label,
.filters input {
	cursor: pointer;
}

.changed-hands {
	cursor: help;
}
</style>
