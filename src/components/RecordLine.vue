<template>
	<tr :class="officialClass">
		<td>
			<div class="img-container">
				<a v-if="!isOfficial" :href="links.workshop">
					<img :src="record.map_preview" width="64" height="36" loading="lazy" @error="hideImage" />
				</a>
			</div>
		</td>
		<td>
			<a v-if="!isOfficial" :href="links.workshop">
				{{ record.map_name }}
			</a>
			<span v-else>
				{{ record.map_name }}
			</span>
		</td>
		<td>{{ record.mode }}</td>
		<td>
			<div v-if="!isOfficial">
				<a :href="links.author">
					{{ record.author }}
				</a>
				<sup> (<a :href="links.authorHB">HB</a><b> • </b><a :href="links.authorHG">HG</a>)</sup>
			</div>
			<span v-else>
				[Official]
			</span>
		</td>
		<td>
			<span v-if="record.record_new_str">{{ record.record_new_str }}</span>
			<span v-else>{{ record.record_new }}</span>
		</td>
		<td>
			<a :href="links.wrHolder">
				{{ record.new_recordholder }}
			</a>
			<sup> (<a :href="links.wrHolderHB">HB</a><b> • </b><a :href="links.wrHolderHG">HG</a>)</sup>
		</td>
		<td class="standing-for">
			<span :title="record.standingForMaxStr">{{ standingForDisplay }}</span>
		</td>
		<td class="changed-hands-td">
			<div class="changed-hands">
				<span>{{ record.previousCount }}/{{ record.previousCountAll }}</span>
				<span class="tooltip" v-html="recordHistoryTooltip"></span>
			</div>
		</td>
	</tr>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps(['record']);

const links = computed(() => ({
	workshop: `https://steamcommunity.com/sharedfiles/filedetails/?id=${props.record.workshop_item_id}`,
	author: `https://steamcommunity.com/profiles/${props.record.steam_id_author}/myworkshopfiles/?appid=233610`,
	wrHolder: `https://steamcommunity.com/profiles/${props.record.steam_id_new_recordholder}`,
	authorHB: `http://holdboost.com/Player?steamID=${props.record.steam_id_author}`,
	wrHolderHB: `http://holdboost.com/Player?steamID=${props.record.steam_id_new_recordholder}`,
	authorHG: `https://holdgrip.seekr.pw/player/${props.record.steam_id_author}/sprint`,
	wrHolderHG: `https://holdgrip.seekr.pw/player/${props.record.steam_id_new_recordholder}/sprint`,
}));

const officialClass = computed(() => ({
	official: props.record.workshop_item_id === '[Official]',
}));

const isOfficial = computed(() => props.record.workshop_item_id === '[Official]');

const standingForDisplay = computed(() => {
	const [num, unit] = props.record.standingForStr.split(' ');
	return `${parseInt(num).toLocaleString()} ${unit}`;
});

function compilePreviousRecords(record) {
	let r = record;
	const records = [];
	while (r.previousRecord) {
		records.push(r);
		r = r.previousRecord;
	}
	records.push(r);
	return records;
}

const recordHistoryTooltip = computed(() => {
	const records = compilePreviousRecords(props.record);
	// console.log(records);
	return records.map((record) => {
		let cleanRecord = record.record_new;
		if (record.mode !== 'Stunt') {
			// remove all leading `00:` from the time
			while (cleanRecord.startsWith('00:')) {
				cleanRecord = cleanRecord.replace(/^00:/, '');
			}
		}
		// trim leading 0 from minutes
		if (cleanRecord.startsWith('0')) {
			cleanRecord = cleanRecord.replace(/^0/, '');
		}
		return `${cleanRecord} by ${record.new_recordholder}`;
	}).join('<br />');
});

// function removeLine(event) {
// 	event.target.closest('tr').remove();
// }

function hideImage(event) {
	event.target.style.display = 'none';
	event.target.closest('tr').classList.add('no-image');
}
</script>

<style scoped>
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

td:nth-child(1) {
	width: 64px;
}

td {
	text-align: center;
}

td:nth-child(2) {
	text-align: left;
	max-width: 25vw;
	white-space: nowrap;
	overflow-x: hidden;
	text-overflow: ellipsis;
	padding-left: 3px;
}

td.standing-for span {
	cursor: help;
}

.img-container {
	height: 36px;
	width: 64px;
	padding: 2px;
}

sup {
	font-size: 0.75em;
}

tr.no-image td:not(.changed-hands-td) {
	filter: blur(0.4px) opacity(0.6);
}

tr.no-image .changed-hands span:not(.tooltip) {
	filter: blur(0.4px) opacity(0.6);
}

.changed-hands-td {
	cursor: help;
}

.changed-hands {
	position: relative;
	display: inline-block;
	/* border-bottom: 1px dotted black; */
	cursor: help;
}

.changed-hands .tooltip {
	visibility: hidden;
	white-space: nowrap;
	width: 280px;
	background-color: #222;
	color: #fff;
	border: 1px solid #aaa;
	text-align: center;
	border-radius: 6px;
	padding: 5px 0;
	position: absolute;
	z-index: 2;
	top: 174%;
	left: 50%;
	margin-left: -180px;
	pointer-events: none;
	opacity: 0;
	transition: all 400ms;
	transform: translate(0, -10px);
}

.changed-hands .tooltip::after {
	content: "";
	position: absolute;
	bottom: 100%;
	left: 64%;
	margin-left: -5px;
	border-width: 5px;
	border-style: solid;
	border-color: transparent transparent #aaa transparent;
}

.changed-hands-td:hover .tooltip {
	visibility: visible;
	opacity: 1;
	cursor: help;
	transform: translate(0, 0);
}
</style>
