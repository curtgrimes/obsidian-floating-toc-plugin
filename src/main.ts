import { HeadingCache, MarkdownView, Plugin } from "obsidian";
import { createApp ,App} from "vue";
import FloatingTableOfContents from "@/components/FloatingTableOfContents.vue";

export function selfDestruct() {
	let float_toc_dom = document.querySelector(
		".floating-toc-div"
	  );
	
	  if (float_toc_dom) {
		if (float_toc_dom.firstChild) {
			float_toc_dom.removeChild(float_toc_dom.firstChild);
		}
		float_toc_dom.remove();
	  }
}
export default class FloatingToc extends Plugin {
	current_note: MarkdownView;
	vueapp: App;
	async onload() {
		const openFileToLine = (lineNumber: number) => {
			const current_file = this.app.workspace.getActiveFile()
			console.log("line number", lineNumber);
			let leaf = this.app.workspace.getLeaf(false);
			leaf.openFile(current_file, {
				eState: { line: lineNumber },
			});
		};
		// TODO: I don't think I can rely on __vueParentComponent here in production but maybe it's okay
		const updateHeadingsForPath = () => {
			 
			let Markdown = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (Markdown) {
				let currentleaf = document.body?.querySelector(
					".workspace-leaf.mod-active"
				);
				let float_toc_dom = currentleaf?.querySelector(".floating-toc");
				if (float_toc_dom)
					(float_toc_dom.__vueParentComponent.props.headings = this.app.metadataCache.getFileCache(
						Markdown.file
					)?.headings);
			}
		}
		const initComponent = () => {

	 
			let Markdown = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (Markdown) {
				let currentleaf = document.body?.querySelector(
					".workspace-leaf.mod-active"
				);
				let float_toc_dom = currentleaf
					?.querySelector(".floating-toc")
				if (!float_toc_dom) {
					const floatingTocWrapper = document.createElement("div");
					floatingTocWrapper.addClass("floating-toc-div");
					this.vueapp = createApp(FloatingTableOfContents, {
						headings: [] as HeadingCache[],
						filePath: Markdown.file.path,
						vaultName: this.app.vault.getName(),
						openFileToLine,
					});
					this.vueapp.config.globalProperties.plugin = this
					this.vueapp.config.globalProperties.container = floatingTocWrapper
					this.vueapp.mount(floatingTocWrapper);
					currentleaf
						?.querySelector(".markdown-source-view")
						.insertAdjacentElement("beforebegin", floatingTocWrapper);

				} else return;
			}
		};

		const updateHeadingsForView = () => {
			initComponent();
			updateHeadingsForPath();
		};
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				let view = this.app.workspace.getActiveViewOfType(MarkdownView)
				if (view) {
					updateHeadingsForView();
					this.current_note = view
				}
			}
			)

		);


		this.registerEvent(
			this.app.workspace.on("editor-change", (editor) => {
				const activeView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (activeView) {
					let resolved = false;

					this.registerEvent(
						this.app.metadataCache.on("resolve", (file) => {
							if (activeView.file === file && !resolved) {
								resolved = true;
								updateHeadingsForView();
							}
						})
					);
				}
			})
		);
		updateHeadingsForView();
	}

	onunload() {
		this.vueapp.unmount();
		selfDestruct();
	}
}
