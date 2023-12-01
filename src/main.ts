import {
	debounce,
	Platform,
	requireApiVersion,
	MarkdownView,
	Plugin,
	HeadingCache,
	App,
} from "obsidian";
import { creatToc, createLi, renderHeader } from "src/components/floatingtocUI";
import { FlotingTOCSettingTab } from "src/settings/settingsTab";
import { FlotingTOCSetting, DEFAULT_SETTINGS } from "src/settings/settingsData";
import { toggleCollapse, hasChildHeading } from "src/components/toggleCollapse";

let activeDocument: Document;
let line = 0;
export function selfDestruct() {
	requireApiVersion("0.15.0")
		? (activeDocument = activeWindow.document)
		: (activeDocument = window.document);
	let float_toc_dom = activeDocument.querySelectorAll(".floating-toc-div");
	float_toc_dom.forEach((element) => {
		if (element) {
			element.remove();
		}
	});
}


export function refresh_node(plugin: FloatingToc, view: MarkdownView) {
	requireApiVersion("0.15.0")
		? (activeDocument = activeWindow.document)
		: (activeDocument = window.document);
	//let currentleaf = activeDocument?.querySelector(".workspace-leaf.mod-active");
	//let view=plugin.app.workspace.getActiveViewOfType(MarkdownView)
	let float_toc_dom = view.contentEl?.querySelector(".floating-toc-div");

	if (float_toc_dom) {
		let ul_dom = float_toc_dom.querySelector(
			"ul.floating-toc"
		) as HTMLElement;
		if (!ul_dom)
			(ul_dom = float_toc_dom.createEl("ul")),
				ul_dom.addClass("floating-toc");
		let li_dom = float_toc_dom?.querySelectorAll("li.heading-list-item") as NodeListOf<HTMLElement>;
		let headingdata = plugin.headingdata;

		if (plugin.settings.ignoreHeaders) {
			let levelsToFilter = plugin.settings.ignoreHeaders.split("\n");
			headingdata = plugin.headingdata?.filter(
				(item: { level: { toString: () => string } }) =>
					!levelsToFilter.includes(item.level.toString())
			);
		}

		if (headingdata) {
			if (li_dom.length >= headingdata.length) {
				li_dom?.forEach((el, i) => {
					if (headingdata[i]) {
						if (
							headingdata[i].level ==
							el.getAttribute("data-level") &&
							headingdata[i].heading ==
							(el.children[0] as HTMLElement).innerText &&
							headingdata[i].position.start.line ==
							el.getAttribute("data-line")
						) {
						 
							//级别，内容行号完全一致

							const index = Number(el.getAttribute("data-id"));

							if (hasChildHeading(index, plugin.headingdata)) {
								{
									if (!el.hasAttribute("iscollapsed")) {
										el.setAttribute("isCollapsed", "false");
									}
								}
							} else {
								if (el.hasAttribute("iscollapsed")) {
									el.removeAttribute("isCollapsed");
								}
							}

							return;
						} else {
							el.setAttribute(
								"data-level",
								headingdata[i].level.toString()
							);
							el.setAttribute("data-id", i.toString());
							el.setAttribute(
								"data-line",
								headingdata[i].position.start.line.toString()
							);
							el.children[0].querySelector("a")?.remove();
						 
							renderHeader(
								plugin,
								view,
								headingdata[i].heading,
								el.children[0] as HTMLElement,
								view.file.path,
								null
							);
							//(el.children[0] as HTMLElement).innerHTML = '<a class="text">' + headingdata[i].heading + '</a>'
							// 如果有子标题则用属性标记，然后在css里用::before显示特殊符号
						}
					} else {
						el.remove();
					}
				});
			} else {
				headingdata?.forEach((el: HeadingCache, i: number) => {
					if (i <= li_dom.length - 1) {
						if (
							el.level.toString() ==
							li_dom[i].getAttribute("data-level") &&
							el.heading ==
							(li_dom[i].children[0] as HTMLElement)
								.innerText &&
							el.position.start.line.toString() ==
							li_dom[i].getAttribute("data-line")
						) {
							//级别，内容行号完全一致就不需要更新。
						 
							const index = Number(
								li_dom[i].getAttribute("data-id")
							);

							if (hasChildHeading(index, plugin.headingdata)) {
								if (!li_dom[i].hasAttribute("iscollapsed"))
									li_dom[i].setAttribute(
										"isCollapsed",
										"false"
									);

							} else {
								if (li_dom[i].hasAttribute("iscollapsed"))
									li_dom[i].removeAttribute(
										"isCollapsed"
									);

							}

							return;
						} else {
							li_dom[i].setAttribute(
								"data-level",
								el.level.toString()
							);
							li_dom[i].setAttribute("data-id", i.toString());
							li_dom[i].setAttribute(
								"data-line",
								el.position.start.line.toString()
							);
							//(li_dom[i].children[0] as HTMLElement).innerHTML = '<a class="text">' + el.heading + '</a>'
							li_dom[i].children[0].querySelector("a")?.remove();
						 
							renderHeader(
								plugin,
								view,
								el.heading,
								li_dom[i].children[0] as HTMLElement,
								view.file.path,
								null
							);
						}
					} else {
						createLi(plugin, view, ul_dom, el, i);
					}
				});
			}
			return true;
		} else {
			ul_dom.remove();
			return false;
		}
	} else return false;
}
function siblingElems(elem: Element) {
	var nodes = [];
	if (elem?.previousElementSibling) {
		while ((elem = elem.previousElementSibling)) {
			if (elem.nodeType == 1) {
				nodes.push(elem);
			}
		}
	}
	return nodes;
}
function _handleScroll(app: App, plugin: FloatingToc, evt: Event): any {
	let target = evt.target as HTMLElement;
	if (
		target.parentElement?.classList.contains("cm-editor") ||
		target.parentElement?.classList.contains("markdown-reading-view")
	) {
		const view = app.workspace.getActiveViewOfType(MarkdownView);
		let current_line;
		let current_heading = {};
		if (view) {
			current_line = view.currentMode.getScroll() ?? 0;
			/* 	let float_toc_dom = view.contentEl?.querySelector(".floating-toc-div");
				let li_dom = float_toc_dom?.querySelectorAll("li.heading-list-item")
				let headline = [];
				li_dom?.forEach((el, i) => {
					headline.push(li_dom[i].getAttribute("data-line"))
				}) */

			//	console.log(current_line, "cthisurrent_line")
			let headings = plugin.headingdata;
			let i = headings?.length ?? 0;
			let floattoc = view.contentEl.querySelector(".floating-toc");
			if (floattoc) {
				let firstline = parseInt(
					floattoc
						.querySelector("li.heading-list-item")
						?.getAttribute("data-line")
				);
				let lastline = parseInt(
					floattoc.lastElementChild?.getAttribute("data-line")
				);
				//滚动到顶部，指示器定位到顶部
				if (current_line <= 0) {
					let prevLocation = floattoc.querySelector(
						".heading-list-item.located"
					);
					if (prevLocation) {
						prevLocation.removeClass("located");
					}

					let curLocation = floattoc?.querySelector(
						`li[data-line='${firstline}']`
					);
					if (curLocation) curLocation.addClass("located");

					let level = parseInt(
						curLocation?.getAttribute("data-level")
					);
					level = level > 1 ? level - 1 : 1;
					let siblings = siblingElems(curLocation);
					let focusele = floattoc?.querySelector(`li.focus`);
					if (focusele) {
						focusele.removeClass("focus");
					}
					siblings.some((element) => {
						if (
							(element as HTMLInputElement).dataset["level"] <=
							level.toString()
						) {
							element.addClass("focus");
							return true;
						}
					});

					let Location: any =
						floattoc.querySelector(".heading-list-item");
					setTimeout(() => Location.scrollIntoViewIfNeeded(), 300);
				} else {
					while (--i >= 0) {
						if (headings[i].position.start.line <= current_line) {
							current_heading = headings[i];
							//	console.log(current_line, "current_line")
							//	console.log(current_heading, "current_heading")
							line = headings[i].position.start.line;
							break;
						}
					}
					if (!current_heading) {
						return;
					}

					//let container = activeDocument?.querySelector(".workspace-leaf.mod-active");

					let prevLocation = floattoc.querySelector(
						".heading-list-item.located"
					);
					if (prevLocation) {
						prevLocation.removeClass("located");
					}

					if (!line && floattoc) line = firstline;
					let curLocation: any = floattoc?.querySelector(
						`li[data-line='${line}']`
					);
					//console.log(curLocation, "curLocation")
					if (curLocation) {
						if (line == lastline || line == firstline) {
							curLocation.addClass("located");
						} else if (curLocation.nextElementSibling) {
							let nextLine = parseInt(
								curLocation.nextElementSibling.getAttribute(
									"data-line"
								)
							);
							if (nextLine <= current_line) {
								//	console.log(nextLine,'nextLine');
								curLocation.nextElementSibling.addClass(
									"located"
								);
								let level = parseInt(
									curLocation.nextElementSibling.getAttribute(
										"data-level"
									)
								);
								level = level > 1 ? level - 1 : 1;
								let siblings = siblingElems(
									curLocation.nextElementSibling
								);
								let focusele =
									floattoc?.querySelector(`li.focus`);
								if (focusele) {
									focusele.removeClass("focus");
								}
								siblings.some((element) => {
									if (
										(element as HTMLInputElement).dataset[
										"level"
										] <= level.toString()
									) {
										element.addClass("focus");
										return true;
									}
								});
							} else {
								//	console.log(view.editor.getScrollInfo(),'getLine');
								curLocation.addClass("located");
								let level = parseInt(
									curLocation.getAttribute("data-level")
								);
								level = level > 1 ? level - 1 : 1;
								let siblings = siblingElems(curLocation);
								let focusele =
									floattoc?.querySelector(`li.focus`);
								if (focusele) {
									focusele.removeClass("focus");
								}
								siblings.some((element) => {
									if (
										(element as HTMLInputElement).dataset[
										"level"
										] <= level.toString()
									) {
										element.addClass("focus");
										return true;
									}
								});
							}
						}
						//curLocation.scrollIntoView({ block: "center" })
						curLocation.scrollIntoViewIfNeeded();
					}
				}
			}
		}
	}
}
export default class FloatingToc extends Plugin {
	app: App;
	settings: FlotingTOCSetting;
	headingdata: any;

	async onload() {
		requireApiVersion("0.15.0")
			? (activeDocument = activeWindow.document)
			: (activeDocument = window.document);
		await this.loadSettings();
		const updateHeadingsForView = (view: MarkdownView) => {
			view
				? refresh_node(this, view)
					? false
					: creatToc(app, this)
				: false;
		};
		let isLoadOnMobile = this.settings.isLoadOnMobile;
		if (Platform.isMobileApp && isLoadOnMobile) {
			console.log(`floating toc disable loading on mobile`);
			return;
		}
		this.addCommand({
			id: "pin-toc-panel",
			name: "Pinning the Floating TOC panel",
			icon: "pin",
			callback: async () => {
				let view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view) {
					let floatingTocWrapper =
						view.contentEl.querySelector(".floating-toc-div");
					if (floatingTocWrapper) {
						if (floatingTocWrapper.classList.contains("pin"))
							floatingTocWrapper.removeClass("pin");
						else floatingTocWrapper.addClass("pin");
					}
				}
			},
		});
		this.addCommand({
			id: "hide-toc-panel",
			name: "Hide/Show the Floating TOC panel",
			icon: "list",
			callback: async () => {
				let view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view) {
					let floatingTocWrapper =
						view.contentEl.querySelector(".floating-toc-div");
					if (floatingTocWrapper) {
						if (floatingTocWrapper.classList.contains("hide"))
							floatingTocWrapper.removeClass("hide");
						else floatingTocWrapper.addClass("hide");
					}
				}
			},
		});
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				let view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view) {
					const current_file = this.app.workspace.getActiveFile();
					let heading =
						this.app.metadataCache.getFileCache(
							current_file
						).headings;
					let cleanheading: HeadingCache[] = [];
					heading?.map((item: HeadingCache) => {
						item.heading = item.heading.replace(
							/<\/?[\s\S]*?(?:".*")*>/g,
							""
						); // clean html tags
						cleanheading.push(item);
					});
					this.headingdata = cleanheading;

					if (this.settings.ignoreHeaders) {
						let levelsToFilter =
							this.settings.ignoreHeaders.split("\n");
						this.headingdata = heading.filter(
							(item) =>
								!levelsToFilter.includes(item.level.toString())
						);
					}
					refresh(view);
				}
			})
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
		this.registerEvent(
			this.app.metadataCache.on("changed", () => {
				let view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view) {
					const current_file = view.file;

					let heading =
						this.app.metadataCache.getFileCache(
							current_file
						).headings;
					let cleanheading: HeadingCache[] = [];
					heading?.map((item: HeadingCache) => {
						item.heading = item.heading.replace(
							/<\/?[\s\S]*?(?:".*")*>/g,
							""
						); // clean html tags
						cleanheading.push(item);
					});
					let newheading = cleanheading?.map((item) => {
						return (
							item.level + item.heading + item.position.start.line
						);
					});
					let newheadingdata = this.headingdata?.map(
						(item: HeadingCache) => {
							return (
								item.level +
								item.heading +
								item.position.start.line
							);
						}
					);
					if (
						JSON.stringify(newheadingdata) ==
						JSON.stringify(newheading)
					)
						return; //标题结构行号没有变化不更新
					else {
						//	console.log("refresh")

						this.headingdata = cleanheading;
						if (this.settings.ignoreHeaders) {
							let levelsToFilter =
								this.settings.ignoreHeaders.split("\n");
							this.headingdata = heading.filter(
								(item) =>
									!levelsToFilter.includes(
										item.level.toString()
									)
							);
						}
						refresh(view);
					}
				}
			})
		);

		const refresh_outline = (view: MarkdownView): any => {
			updateHeadingsForView(view);
		};
		const refresh = (view: MarkdownView) =>
			debounce(refresh_outline(view), 300, true);
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

		activeDocument.addEventListener(
			"scroll",
			(event) => {
				this.handleScroll(this.app, this, event);
			},
			true
		);
		this.addSettingTab(new FlotingTOCSettingTab(this.app, this));

		updateHeadingsForView(
			this.app.workspace.getActiveViewOfType(MarkdownView)
		);
		if (requireApiVersion("0.15.0")) {
			this.app.workspace.on("window-open", (leaf) => {
				leaf.doc.addEventListener(
					"scroll",
					(event) => {
						this.handleScroll(this.app, this, event);
					},
					true
				);
			});
		}
		app.workspace.onLayoutReady(() => {
			app.workspace.trigger("parse-style-settings");
		});
	}

	handleScroll = (app: App, plugin: FloatingToc, evt: Event) =>
		debounce(_handleScroll(app, plugin, evt), 200);

	onunload() {
		requireApiVersion("0.15.0")
			? (activeDocument = activeWindow.document)
			: (activeDocument = window.document);
		activeDocument.removeEventListener(
			"scroll",
			(event) => {
				this.handleScroll(this.app, this, event);
			},
			true
		);
		selfDestruct();
	}
	setHeadingdata(content: HeadingCache): void {
		this.headingdata = content;
	}
	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
