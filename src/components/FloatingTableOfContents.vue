<script setup lang="ts">
import { computed, ref, Ref, watch, getCurrentInstance, onMounted, onUnmounted, } from "vue";
import { MarkdownView, View, HeadingCache, debounce, Constructor, FoldPosition } from "obsidian";
import HeadingListItem from "@/components/HeadingListItem.vue";
import FloatingToc from "../main"
let plugin = getCurrentInstance()?.appContext.config.globalProperties.plugin as FloatingToc
let container = getCurrentInstance()?.appContext.config.globalProperties.container as HTMLElement
const props = defineProps<{
	headings: HeadingCache[];
	filePath: string;
	vaultName: string;
	openFileToLine: CallableFunction;
}>();

const reveal = ref(false);

function foldheader(headingInfo): void {
	const view = plugin.app.workspace.getActiveViewOfType(MarkdownView)
	const existingFolds = view?.currentMode.getFoldInfo()?.folds ?? [];
	const headfrom = headingInfo.position.start.line
	let index = 0;
	if (existingFolds.some((item, idx) => { index = idx; return item.from == headfrom })) //标题原来已经折叠状态
	existingFolds.splice(index, 1); //删除折叠状态
	else{
	let headingsAtLevel = {
		from: headingInfo.position.start.line,
		to: headingInfo.position.start.line + 1,
	}
	existingFolds.push(headingsAtLevel);
	}	

	view?.currentMode.applyFoldInfo({
		folds: existingFolds,
		lines: view.editor.lineCount(),
	});
	view?.onMarkdownFold();
}



// register scroll event
onMounted(() => {
	document.addEventListener("scroll", handleScroll, true)
})
onUnmounted(() => {
	document.removeEventListener("scroll", handleScroll, true)
})
let handleScroll = debounce(_handleScroll, 100)
function _handleScroll(evt: Event) {
	let target = evt.target as HTMLElement
	if (!target.classList.contains("markdown-preview-view") && !target.classList.contains("cm-scroller")) {
		return
	}
	const view = plugin.app.workspace.getActiveViewOfType(MarkdownView)
	let current_line
	let current_heading = {};
	if (view)
		current_line = view.currentMode.getScroll() 
	let i = props.headings.length
	while (--i >= 0) {
		if (props.headings[i].position.start.line <= current_line) {
			current_heading = props.headings[i]
			break
		}
	}
	if (!current_heading) {
		return
	}
	let index = i
	let prevLocation = container.querySelector(".heading-list-item.located")
	if (prevLocation) {
		prevLocation.removeClass("located")
	}
	let floattoc = container.querySelector(".floating-toc")
	let curLocation = floattoc?.querySelector(`li[data-id='${index}']`)
	if (curLocation) {
		curLocation.addClass("located")
	}
}



</script>

<template>
	<ul class="floating-toc" :data-reveal="reveal" @mouseleave="reveal = false">
		<HeadingListItem v-for="heading,index in headings" :key="heading.heading" :heading="heading.heading"
			:level="heading.level" :index="index" @click="
				openFileToLine(heading.position.start.line);
				reveal = false;
			" @click.ctrl="foldheader(heading)" :reveal="reveal" @reveal="reveal = true" />
	</ul>
</template>

<style lang="scss" scoped>
.floating-toc {
	list-style: none;
	margin: 0;
	padding: 0.1rem;
	position: absolute;
	top: 80px;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	overflow: hidden;

	bottom: 40px;
	width: 2rem;

	&[data-reveal="true"] {
		width: auto;
		overflow: auto;
	}

	&[data-reveal="true"]::-webkit-scrollbar {
		display: none;
	}
}
</style>

<style lang="scss">
.workspace-leaf-content .floating-toc-div+.markdown-source-view .cm-editor {
	padding-left: 2rem;
	/* should match or be slightly more than .floating-toc width above */
}

.workspace-leaf-content .floating-toc-div~.markdown-reading-view .markdown-preview-view {
	padding-left: 4rem;
	/* should match or be slightly more than .floating-toc width above */
}
</style>
