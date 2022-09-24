import { debounce, requireApiVersion, MarkdownView, Plugin, HeadingCache, App } from "obsidian";
import { CreatToc, createli,renderHeader } from "src/components/floatingtocUI"
import { FlotingTOCSettingTab } from "src/settings/settingsTab";
import { FlotingTOCSetting, DEFAULT_SETTINGS } from "src/settings/settingsData";

let activeDocument: Document;
export function selfDestruct() {
	requireApiVersion("0.15.0") ? activeDocument = activeWindow.document : activeDocument = window.document;
	let float_toc_dom = activeDocument.querySelectorAll(
		".floating-toc-div"
	);
	float_toc_dom.forEach(element => {
		if (element) {
			element.remove();
		}

	});

}

export function refresh_node(view: MarkdownView) {
	requireApiVersion("0.15.0") ? activeDocument = activeWindow.document : activeDocument = window.document;
	//let currentleaf = activeDocument?.querySelector(".workspace-leaf.mod-active");
	//let view=plugin.app.workspace.getActiveViewOfType(MarkdownView)
	let float_toc_dom = view.contentEl?.querySelector(".floating-toc-div");
	//console.log(float_toc_dom,"float_toc_dom")
	if (float_toc_dom) {
		let ul_dom = float_toc_dom.querySelector("ul.floating-toc") as HTMLElement
		if (!ul_dom)
			ul_dom = float_toc_dom.createEl("ul"), ul_dom.addClass("floating-toc")
		let li_dom = float_toc_dom?.querySelectorAll("li.heading-list-item")
		let headingdata = globalThis.headingdata
		//console.log(headingdata,"headingdata")
		if (headingdata) {
		//	console.log("refresh_node")
			if (li_dom.length >= headingdata.length) {
				li_dom?.forEach((el, i) => {
					if (headingdata[i]) {
						if ((headingdata[i].level == el.getAttribute("data-level"))
							&& (headingdata[i].heading == (el.children[0] as HTMLElement).innerText)
							&& (headingdata[i].position.start.line == el.getAttribute("data-line"))) //级别，内容行号完全一致就不需要更新。
							return
						else {
							el.setAttribute("data-level", headingdata[i].level.toString());
							el.setAttribute("data-id", i.toString());
							el.setAttribute("data-line", headingdata[i].position.start.line.toString());
							 el.children[0].querySelector("a")?.remove();
							renderHeader( headingdata[i].heading,el.children[0]  as HTMLElement,view.file.path,null)
							//(el.children[0] as HTMLElement).innerHTML = '<a class="text">' + headingdata[i].heading + '</a>'
						}
					} else {
						el.remove()
					}

				});

			} else {
				headingdata?.forEach((el: HeadingCache, i: number) => {
					if (i <= (li_dom.length - 1)) {
						if ((el.level.toString() == li_dom[i].getAttribute("data-level"))
							&& (el.heading == (li_dom[i].children[0] as HTMLElement).innerText)
							&& (el.position.start.line.toString() == li_dom[i].getAttribute("data-line"))) //级别，内容行号完全一致就不需要更新。
							return
						else {
							li_dom[i].setAttribute("data-level", el.level.toString());
							li_dom[i].setAttribute("data-id", i.toString());
							li_dom[i].setAttribute("data-line", el.position.start.line.toString());
							//(li_dom[i].children[0] as HTMLElement).innerHTML = '<a class="text">' + el.heading + '</a>'
							li_dom[i].children[0].querySelector("a")?.remove();
							renderHeader( el.heading,li_dom[i].children[0]  as HTMLElement,view.file.path,null)

						}
					} else {

						createli(view, ul_dom, el, i)
					}
				});
			}
			return true;
		} else {
			ul_dom.remove();
		}

	} else
		return false;

}
function _handleScroll(evt: Event) {
	let target = evt.target as HTMLElement
	if (target.parentElement?.classList.contains("cm-editor") || target.parentElement?.classList.contains("markdown-reading-view")) {
		const view = app.workspace.getActiveViewOfType(MarkdownView)
		let current_line
		let current_heading = {};
		if (view) {
			current_line = view.currentMode.getScroll() 
		/* 	let float_toc_dom = view.contentEl?.querySelector(".floating-toc-div");
			let li_dom = float_toc_dom?.querySelectorAll("li.heading-list-item")
			let headline = [];
			li_dom?.forEach((el, i) => {
				headline.push(li_dom[i].getAttribute("data-line"))
			}) */


			let headings = globalThis.headingdata
			let i = headings?.length ?? 0
			let line 
			while (--i >= 0) {
				if (headings[i].position.start.line <= current_line) {
					current_heading = headings[i]
				//	console.log(current_heading)
					line = headings[i].position.start.line
					break
				}
			}
			if (!current_heading) {
				return
			}
			
			let container = activeDocument?.querySelector(".workspace-leaf.mod-active");
			let prevLocation = container.querySelector(".heading-list-item.located")
			if (prevLocation) {
				prevLocation.removeClass("located")
			}
		
			let floattoc = container.querySelector(".floating-toc")
			let curLocation = floattoc?.querySelector(`li[data-line='${line}']`)
			if (curLocation) {
				if(curLocation.nextElementSibling)
				curLocation.nextElementSibling.addClass("located")
				else
				curLocation.lastElementChild.addClass("located")
			}
		}
	}
}
const handleScroll = debounce(_handleScroll, 200)
export default class FloatingToc extends Plugin {
	settings: any;
	async onload() {
		requireApiVersion("0.15.0") ? activeDocument = activeWindow.document : activeDocument = window.document;
		await this.loadSettings();
		const updateHeadingsForView = (view: MarkdownView) => {
			view ? refresh_node(view) ? false : CreatToc(app, this) : false

		};
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				let view = this.app.workspace.getActiveViewOfType(MarkdownView)
				if (view) {
					const current_file = this.app.workspace.getActiveFile()
					let heading = this.app.metadataCache.getFileCache(current_file).headings
					globalThis.headingdata = heading
					//		console.log("refresh")
					refresh(view);
				}
			}
			)
		);
		/* 		this.registerEvent(this.app.workspace.on("file-open", (file) => {
					let view = this.app.workspace.getActiveViewOfType(MarkdownView)
					if (view) {
						const current_file = this.app.workspace.getActiveFile()
						let heading = this.app.metadataCache.getFileCache(current_file).headings
						globalThis.headingdata = heading
						console.log("refresh")
						refresh(view);
					}
				}
				)
				); */
		this.registerEvent(this.app.metadataCache.on('changed', () => {
			let view = this.app.workspace.getActiveViewOfType(MarkdownView)
			if (view) {
				const current_file = view.file

				let heading = this.app.metadataCache.getFileCache(current_file).headings
				let newheading = heading?.map(item => {
					return item.level + item.heading + item.position.start.line
				})
				let newheadingdata = globalThis.headingdata?.map((item: HeadingCache) => {
					return item.level + item.heading + item.position.start.line
				})
				if (JSON.stringify(newheadingdata) == JSON.stringify(newheading))
					return  //标题结构行号没有变化不更新
				else {
				//	console.log("refresh")
					globalThis.headingdata = heading
					refresh(view)
				}
			}

		}))

		const refresh_outline = (view: MarkdownView): any => {
			updateHeadingsForView(view)
		}
		const refresh = (view: MarkdownView) => debounce(refresh_outline(view), 300, true)
		/* 		this.registerEvent(
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
				); */


		activeDocument.addEventListener("scroll", handleScroll, true)
		this.addSettingTab(new FlotingTOCSettingTab(this.app, this));

		updateHeadingsForView(this.app.workspace.getActiveViewOfType(MarkdownView));
		if (requireApiVersion("0.15.0")) {
			this.app.workspace.on('window-open', (leaf) => {
				leaf.doc.addEventListener("scroll", handleScroll, true)
			});
		}
		if (app.workspace.layoutReady) app.workspace.trigger("parse-style-settings");

	}

	onunload() {
		requireApiVersion("0.15.0") ? activeDocument = activeWindow.document : activeDocument = window.document;
		activeDocument.removeEventListener("scroll", handleScroll, true)
		selfDestruct();
	}
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
