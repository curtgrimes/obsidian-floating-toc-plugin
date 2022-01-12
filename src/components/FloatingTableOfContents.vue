<script setup lang="ts">
import { computed, ref, Ref, watch } from "vue";
import { HeadingCache } from "obsidian";
import HeadingListItem from "@/components/HeadingListItem.vue";

const props = defineProps<{
	headings: HeadingCache[];
	filePath: string;
	vaultName: string;
	openFileToLine: CallableFunction;
}>();

const reveal = ref(false);
</script>

<template>
	<ul class="floating-toc" :data-reveal="reveal" @mouseleave="reveal = false">
		<HeadingListItem
			v-for="heading in headings"
			:key="heading.heading"
			:heading="heading.heading"
			:level="heading.level"
			@click="
				openFileToLine(heading.position.start.line);
				reveal = false;
			"
			:reveal="reveal"
			@reveal="reveal = true"
		/>
	</ul>
</template>

<style lang="scss" scoped>
.floating-toc {
	list-style: none;
	margin: 0;
	padding: 0.1rem;
	position: absolute;
	top: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	overflow: hidden;

	bottom: 0;
	width: 2rem;

	&[data-reveal="true"] {
		width: auto;
		overflow: visible;
	}
}
</style>

<style lang="scss">
.workspace-leaf-content .cm-editor {
	padding-left: 2rem; /* should match or be slightly more than .floating-toc width above */
}
</style>
