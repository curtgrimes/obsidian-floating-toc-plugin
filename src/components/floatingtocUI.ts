
import type FloatingToc from "src/main";
import { App, Notice, requireApiVersion, MarkdownView, Component, HeadingCache, MarkdownRenderer, ButtonComponent, View } from "obsidian";
import { toggleCollapse, hasChildHeading } from "./toggleCollapse"


export async function renderHeader(
    plugin: FloatingToc,
    view: MarkdownView,
    source: string,
    container?: HTMLElement,
    notePath?: string,
    component: Component = null
) {
    const regex = /(?<=^\s*)[0-9]+\.\s/; //有序列表
    const regex2 = /(?<=^\s*)[\-\+]\s/; //无序列表  
    let m;
    let prelist = '';
    if ((m = regex.exec(source)) !== null) {
        prelist = m[0]
        source = source.replace(regex, '');
    } else if ((m = regex2.exec(source)) !== null) {
        prelist = m[0]
        source = source.replace(regex2, '');
    }
    const index = Number(container.parentElement.getAttribute("data-id"));
    const level = Number(container.parentElement.getAttribute("data-level"));
    // 如果有子标题则用属性标记，然后在css里用::before显示特殊符号
    if (hasChildHeading(index, plugin.headingdata)) {
    
        if (level >= plugin.settings.defaultCollapsedLevel) {
            container.parentElement.setAttribute("isCollapsed", "true");
        } else {
            container.parentElement.setAttribute("isCollapsed", "false");
        }
    }

    // 初始隐藏一定层级的标签
    if (level > plugin.settings.defaultCollapsedLevel) {
        container.parentElement.style.display = "none";
    }
    container.parentElement.addEventListener("click", (e) => { toggleCollapse(e, container.parentElement); });

    let subcontainer = container
    await MarkdownRenderer.renderMarkdown(
        source,
        subcontainer,
        notePath,
        component
    );
    if (subcontainer) { // heading-list-item .div 里面的标题渲染完毕, 可以显示伪元素了
        subcontainer.classList.add('heading-rendered');

    }

    let atag = subcontainer.createEl("a");
    atag.addClass("text")
    atag.onclick = function (event) {
        event.stopPropagation();
        let startline = parseInt(subcontainer.parentElement.getAttribute("data-line")) ?? 0
        if (event.ctrlKey || event.metaKey) {
            foldHeader(view, startline)
        } else {
            openFiletoline(view, startline)
            let prevLocation = subcontainer.parentElement.parentElement.querySelector(".text-wrap.located")
            if (prevLocation) {
                prevLocation.removeClass("located")
            }
            subcontainer.addClass("located")
        }
    }
    let par = subcontainer.querySelector("p");
    if (par) {
        const regex = /<a[^>]*>|<\/[^>]*a>/gm; //删除所有a标签
        //const regex = /(?<=\>[^<]*?) /g; //删除所有空白符
        if (prelist)
            atag.innerHTML = prelist + par.innerHTML.replace(regex, '');
        else atag.innerHTML = par.innerHTML.replace(regex, '');
        subcontainer.removeChild(par);
        if (plugin.settings.isTooltip) {
            subcontainer.setAttribute('aria-label', source)
            if (plugin.settings.positionStyle == "right")
                subcontainer.setAttribute('aria-label-position', 'left')
            if (plugin.settings.positionStyle == "left")
                subcontainer.setAttribute('aria-label-position', 'right')
            if (plugin.settings.positionStyle == "both")
                subcontainer.setAttribute('aria-label-position', 'top')
        }
    }


}

export async function createLi(plugin: FloatingToc, view: MarkdownView, ul_dom: HTMLElement, heading: HeadingCache, index: number) {
    let li_dom = ul_dom.createEl("li")
    li_dom.addClass("heading-list-item")
    li_dom.setAttribute("data-level", heading.level.toString())
    li_dom.setAttribute("data-id", index.toString())
    li_dom.setAttribute("data-line", heading.position.start.line.toString())
    let text_dom = li_dom.createEl("div")
    text_dom.addClass("text-wrap")
    renderHeader(plugin, view, heading.heading, text_dom, view.file.path, null)

    // // 如果有子标题则用属性标记，然后在css里用::before显示特殊符号
    // if (hasChildHeading(index, plugin.headingdata)) {
    //     if (heading.level >= plugin.settings.defaultCollapsedLevel ) {
    //         li_dom.setAttribute("isCollapsed", "true");
    //     } else {
    //         li_dom.setAttribute("isCollapsed", "false");
    //     }
    // }

    // // 初始隐藏一定层级的标签
    // if (heading.level > plugin.settings.defaultCollapsedLevel ) {
    //     li_dom.style.display ="none";
    // }
    // li_dom.addEventListener("click", (e) => { toggleCollapse(e,li_dom); });

    // text.innerHTML = heading.heading
    let line_dom = li_dom.createEl("div")
    line_dom.addClass("line-wrap")
    line_dom.createDiv().addClass("line")
}

const openFiletoline = (view: MarkdownView, lineNumber: number) => {
    //const current_file = plugin.app.workspace.getActiveFile()
    //     console.log("line number", lineNumber);
    // let leaf = plugin.app.workspace.getLeaf(false);
    view.leaf.openFile(view.file, {
        eState: { line: lineNumber },
    });
};
const foldHeader = (view: MarkdownView, startline: number) => {
    // const view = plugin.app.workspace.getActiveViewOfType(MarkdownView)
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

export function creatToc(
    app: App,
    plugin: FloatingToc
): void {

    const genToc = (currentleaf: HTMLElement, floatingTocWrapper: HTMLDivElement) => {
        const current_file = app.workspace.getActiveFile()

        let heading = app.metadataCache.getFileCache(current_file).headings
        let cleanheading: HeadingCache[] = []
        heading?.map((item: HeadingCache) => {
            item.heading = item.heading.replace(/<\/?[\s\S]*?(?:".*")*>/g, ""); // clean html tags
            cleanheading.push(item)
        })
        plugin.headingdata = cleanheading;
        if (plugin.headingdata.length == 0) return;
        if (plugin.settings.positionStyle == "right")
            floatingTocWrapper.addClass("floating-right"), floatingTocWrapper.removeClass("floating-left"), floatingTocWrapper.removeClass("floating-both")
        else if (plugin.settings.positionStyle == "left")
            floatingTocWrapper.addClass("floating-left"), floatingTocWrapper.removeClass("floating-rigth"), floatingTocWrapper.removeClass("floating-both")
        else if (plugin.settings.positionStyle == "both")
            floatingTocWrapper.addClass("floating-both"), floatingTocWrapper.removeClass("floating-left"), floatingTocWrapper.removeClass("floating-rigth")
        if (plugin.settings.isLeft)
            floatingTocWrapper.removeClass("alignLeft"), floatingTocWrapper.addClass("alignLeft")
        else floatingTocWrapper.removeClass("alignLeft")
        let ul_dom = floatingTocWrapper.createEl("ul")
        ul_dom.addClass("floating-toc")
        let toolbar = ul_dom.createEl("div")
        toolbar.addClass("toolbar")
        toolbar.addClass("pin")
        toolbar.addClass("hide")
        let pinButton = new ButtonComponent(toolbar);
        pinButton
            .setIcon("pin")
            .setTooltip("pin")
            .onClick(() => {
                if (floatingTocWrapper.classList.contains("pin"))
                    floatingTocWrapper.removeClass("pin")
                else
                    floatingTocWrapper.addClass("pin");
            });
        ul_dom.onmouseenter = function () { //移入事件
            toolbar.removeClass("hide")
            floatingTocWrapper.addClass("hover")
        }
        ul_dom.onmouseleave = function () { //移出事件
            toolbar.addClass("hide")
            floatingTocWrapper.removeClass("hover")
        }
        let topBuuton = new ButtonComponent(toolbar);
        topBuuton
            .setIcon("double-up-arrow-glyph")
            .setTooltip("Scroll to Top")
            .setClass("top")
            .onClick(() => {
                const view = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (view) {
                    view.setEphemeralState({ "scroll": 0 });
                }
            });

        let CopyBuuton = new ButtonComponent(toolbar);
        CopyBuuton
            .setIcon("copy")
            .setTooltip("copy to clipboard")
            .setClass("copy")
            .onClick(async () => {
                let headers = plugin.headingdata.map((h: HeadingCache) => {
                    return "    ".repeat(h.level - 1) + h.heading
                })
                await navigator.clipboard.writeText(headers.join("\n"))
                new Notice("Copied")
            });


        if (plugin.settings.ignoreHeaders) {
            let levelsToFilter = plugin.settings.ignoreHeaders.split("\n");
            plugin.headingdata = app.metadataCache.getFileCache(current_file).headings?.filter(item => !levelsToFilter.includes(item.level.toString()));
        }
        // plugin.headingdata = app.metadataCache.getFileCache(current_file).headings.slice(1);


        plugin.headingdata.forEach((heading: HeadingCache, index: number) => {
            const view = app.workspace.getActiveViewOfType(MarkdownView);
            createLi(plugin, view, ul_dom, heading, index);
        });

        currentleaf
            ?.querySelector(".markdown-source-view")
            .insertAdjacentElement("beforebegin", floatingTocWrapper);


    };
    let Markdown = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (Markdown) {
        requireApiVersion("0.15.0") ? activeDocument = activeWindow.document : activeDocument = window.document;
        let view = plugin.app.workspace.getActiveViewOfType(MarkdownView)
        if (view) {
            let float_toc_dom = view.contentEl?.querySelector(".floating-toc-div");
            if (!float_toc_dom) {
                const floatingTocWrapper = createEl("div");
                floatingTocWrapper.addClass("floating-toc-div");
                if (plugin.settings.isDefaultPin) floatingTocWrapper.addClass("pin")
                genToc(view.contentEl, floatingTocWrapper)
            } else return;
        }
    }

}