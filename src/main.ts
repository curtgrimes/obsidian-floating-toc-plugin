import { HeadingCache, MarkdownView, Plugin } from "obsidian";
import { createApp } from "vue";
import FloatingTableOfContents from "@/components/FloatingTableOfContents.vue";

export default class MyPlugin extends Plugin {
	async onload() {
		// TODO: I don't think I can rely on __vueParentComponent here in production but maybe it's okay
		const updateHeadingsForPath = (view: MarkdownView) =>
			(view.contentEl.querySelector(
				".floating-toc"
			).__vueParentComponent.props.headings = this.app.metadataCache.getFileCache(
				view.file
			)?.headings);

		const initComponent = (view: MarkdownView) => {
			if (
				!view.contentEl.querySelector(
					".markdown-source-view .floating-toc"
				)
			) {
				const floatingTocWrapper = document.createElement("div");

				const openFileToLine = (lineNumber: number) => {
					console.log("line number", lineNumber);
					this.app.workspace
						.getActiveViewOfType(MarkdownView)
						.leaf.openFile(view.file, {
							eState: { line: lineNumber },
						});
				};

				const app = createApp(FloatingTableOfContents, {
					headings: [] as HeadingCache[],
					filePath: view.file.path,
					vaultName: this.app.vault.getName(),
					openFileToLine,
				});

				app.mount(floatingTocWrapper);
				view.contentEl
					.querySelector(".markdown-source-view")
					.append(floatingTocWrapper);
			}
		};

		const updateHeadingsForView = (view: MarkdownView) => {
			initComponent(view);
			updateHeadingsForPath(view);
		};

		this.registerEvent(
			this.app.workspace.on("file-open", (file) => {
				updateHeadingsForView(
					this.app.workspace.getActiveViewOfType(MarkdownView)
				);
			})
		);

		this.registerEvent(
			this.app.workspace.on("editor-change", (editor) => {
				const activeView =
					this.app.workspace.getActiveViewOfType(MarkdownView);

				let resolved = false;

				this.registerEvent(
					this.app.metadataCache.on("resolve", (file) => {
						if (activeView.file === file && !resolved) {
							resolved = true;
							updateHeadingsForView(activeView);
						}
					})
				);
			})
		);
	}

	onunload() {}
}
