
import type FloatingToc from "src/main";
import { App, requireApiVersion, MarkdownView, HeadingCache } from "obsidian";

export function createli(plugin:FloatingToc,ul_dom: HTMLElement, heading: HeadingCache, index: number) {
    let li_dom = ul_dom.createEl("li")
    li_dom.addClass("heading-list-item")
    li_dom.setAttribute("data-level", heading.level.toString())
    li_dom.setAttribute("data-id", index.toString())
    li_dom.setAttribute("data-line", heading.position.start.line.toString())
    li_dom.onclick = function (event) {
      let  startline= parseInt(li_dom.getAttribute("data-line"))??0
        if (event.ctrlKey) {
            foldheader(plugin,startline)
        } else {
            openFileToLine(plugin,startline)
        }
    }

    let text_dom = li_dom.createEl("div")
    text_dom.addClass("text-wrap")
    let text = text_dom.createEl("a")
    text.addClass("text")
    text.innerHTML = heading.heading
    let line_dom = li_dom.createEl("div")
    line_dom.addClass("line-wrap")
    line_dom.createDiv().addClass("line")
}

const openFileToLine = (plugin:FloatingToc,lineNumber: number) => {
    const current_file = plugin.app.workspace.getActiveFile()
    //     console.log("line number", lineNumber);
    let leaf = plugin.app.workspace.getLeaf(false);
    leaf.openFile(current_file, {
        eState: { line: lineNumber },
    });
};
const foldheader = (plugin:FloatingToc,startline:number) => {
    const view = plugin.app.workspace.getActiveViewOfType(MarkdownView)
    const existingFolds = view?.currentMode.getFoldInfo()?.folds ?? [];
    const headfrom = startline
    let index = 0;
    if (existingFolds.some((item, idx) => { index = idx; return item.from == headfrom })) //标题原来已经折叠状态
        existingFolds.splice(index, 1); //删除折叠状态
    else {
        let headingsAtLevel = {
            from: startline,
            to: startline + 1,
        }
        existingFolds.push(headingsAtLevel);
    }

    view?.currentMode.applyFoldInfo({
        folds: existingFolds,
        lines: view.editor.lineCount(),
    });
    view?.onMarkdownFold();
}

export function CreatToc(
    app: App,
    plugin: FloatingToc
): void {

    const genToc = (currentleaf: Element, floatingTocWrapper: HTMLDivElement) => {
        let ul_dom = floatingTocWrapper.createEl("ul")
        ul_dom.addClass("floating-toc")
        const current_file = this.app.workspace.getActiveFile()
        globalThis.headingdata = this.app.metadataCache.getFileCache(current_file).headings
        if (globalThis.headingdata) {
            globalThis.headingdata.forEach((heading: HeadingCache, index: number) => {
                createli(plugin,ul_dom, heading, index)
            });

            currentleaf
                ?.querySelector(".markdown-source-view")
                .insertAdjacentElement("beforebegin", floatingTocWrapper);
        }

    };
    let Markdown = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (Markdown) {
        requireApiVersion("0.15.0") ? activeDocument = activeWindow.document : activeDocument = window.document;
        let currentleaf = activeDocument?.querySelector(
            ".workspace-leaf.mod-active"
        );
        let float_toc_dom = currentleaf
            ?.querySelector(".floating-toc")
        if (!float_toc_dom) {
            const floatingTocWrapper = createEl("div");
            floatingTocWrapper.addClass("floating-toc-div");

            genToc(currentleaf, floatingTocWrapper)
        } else return;
    }

}