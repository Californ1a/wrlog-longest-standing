<template>
	<tr :class="isOfficial">
		<td>
			<div class="img-container">
				<a v-if="record.workshop_item_id !== '[Official]'" :href="workshopLink">
					<img :src="record.map_preview" width="64" height="36" loading="lazy" @error="hideImage" />
				</a>
			</div>
		</td>
		<td>
			<a v-if="record.workshop_item_id !== '[Official]'" :href="workshopLink">
				{{ record.map_name }}
			</a>
			<span v-else>
				{{ record.map_name }}
			</span>
		</td>
		<td>{{ record.mode }}</td>
		<td>
			<a v-if="record.workshop_item_id !== '[Official]'" :href="authorLink">
				{{ record.author }}
			</a>
			<span v-else>
				[Official]
			</span>
		</td>
		<td>{{ record.record_new }}</td>
		<td>
			<a :href="wrHolderLink">
				{{ record.new_recordholder }}
			</a>
		</td>
		<td>
			<span :title="record.standingForMaxStr">{{ record.standingForStr }}</span>
		</td>
	</tr>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps(['record']);

const workshopLink = computed(() => {
	return `https://steamcommunity.com/sharedfiles/filedetails/?id=${props.record.workshop_item_id}`;
});

const authorLink = computed(() => {
	return `https://steamcommunity.com/profiles/${props.record.steam_id_author}/myworkshopfiles/?appid=233610`;
});

const wrHolderLink = computed(() => {
	return `https://steamcommunity.com/profiles/${props.record.steam_id_new_recordholder}`;
});

const isOfficial = computed(() => ({
	official: props.record.workshop_item_id === '[Official]',
}));

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
</style>
