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
		<td>{{ record.record_new }}</td>
		<td>
			<a :href="links.wrHolder">
				{{ record.new_recordholder }}
			</a>
			<sup> (<a :href="links.wrHolderHB">HB</a><b> • </b><a :href="links.wrHolderHG">HG</a>)</sup>
		</td>
		<td>
			<span :title="record.standingForMaxStr">{{ standingForDisplay }}</span>
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

// function removeLine(event) {
// 	event.target.closest('tr').remove();
// }

function hideImage(event) {
	event.target.style.display = 'none';
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

td:last-child span {
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
</style>
