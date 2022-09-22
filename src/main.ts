import { debounce, requireApiVersion, MarkdownView, Plugin, HeadingCache, App } from "obsidian";
import { CreatToc, createli } from "src/components/floatingtocUI"




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

export function resetcurrentleaf(plugin: FloatingToc) {
	requireApiVersion("0.15.0") ? activeDocument = activeWindow.document : activeDocument = window.document;
	let currentleaf = activeDocument?.querySelector(
		".workspace-leaf.mod-active"
	);
	let float_toc_dom = currentleaf?.querySelector(".floating-toc-div");
	if (float_toc_dom) {
		let ul_dom = float_toc_dom.querySelector("ul.floating-toc") as HTMLElement
		let li_dom = float_toc_dom?.querySelectorAll("li.heading-list-item")
		let headingdata = globalThis.headingdata
		if (headingdata) {
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
							(el.children[0] as HTMLElement).innerHTML = '<a class="text">' + headingdata[i].heading + '</a>'
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
							(li_dom[i].children[0] as HTMLElement).innerHTML = '<a class="text">' + el.heading + '</a>'

						}
					} else {

						createli(plugin, ul_dom, el, i)
					}
				});
			}
			return true;
		} else
			return false;
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
			let headings = globalThis.headingdata
			let i = headings?.length ?? 0
			while (--i >= 0) {
				if (headings[i].position.start.line <= current_line) {
					current_heading = headings[i]
					break
				}
			}
			if (!current_heading) {
				return
			}
			let index = i
			let container = activeDocument?.querySelector(".workspace-leaf.mod-active");
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
	}
}
const handleScroll = debounce(_handleScroll, 200)
export default class FloatingToc extends Plugin {

	async onload() {

		const updateHeadingsForView = () => {
		//	console.log("updateHeadingsForView")
			if (!resetcurrentleaf(this)) CreatToc(app, this)
		};
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				let view = this.app.workspace.getActiveViewOfType(MarkdownView)
				if (view) {
					const current_file = this.app.workspace.getActiveFile()
					let heading = this.app.metadataCache.getFileCache(current_file).headings
					globalThis.headingdata = heading
					refresh();
				}
			}
			)
		);
		this.registerEvent(this.app.metadataCache.on('changed', () => {
			const current_file = this.app.workspace.getActiveFile()
			let heading = this.app.metadataCache.getFileCache(current_file).headings
			let newheading = heading?.map(item => {
				return item.level + item.heading +  item.position.start.line
			})
			let newheadingdata = globalThis.headingdata?.map((item:HeadingCache) => {
				return item.level + item.heading +  item.position.start.line
			})
			if (JSON.stringify(newheadingdata) == JSON.stringify(newheading))
				return  //标题结构行号没有变化不更新
			else {
				console.log("refresh")
				globalThis.headingdata = heading
				refresh()
			}

		}))

		const refresh_outline = () => {
			updateHeadingsForView()
		}
		const refresh = debounce(refresh_outline, 300, true)
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

		updateHeadingsForView();
		if (requireApiVersion("0.15.0")) {
			this.app.workspace.on('window-open', (leaf) => {
				leaf.doc.addEventListener("scroll", handleScroll, true)
			});
		}

	}

	onunload() {
		activeDocument.removeEventListener("scroll", handleScroll, true)
		selfDestruct();
	}
}
