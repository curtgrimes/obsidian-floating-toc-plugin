// 判断是否存在子标题
export function hasChildHeading(headingIndex: number, allHeadings: any) {
    return headingIndex + 1 < allHeadings.length 
            ?  allHeadings[headingIndex + 1].level > allHeadings[headingIndex].level
            : false;
}


export function toggleCollapse(li: HTMLElement) {
    event.stopPropagation();
    const isCollapsed = li.getAttribute("isCollapsed")
    if (isCollapsed !== null) { // 只处理有collapsed属性的父节点
        if (isCollapsed === "true") {
            expandHeading(li);
        } else if (isCollapsed === "false") {
            collapseHeading(li);
        }
    }
}

// 仅展开当前标题的直接子标题
function expandHeading(liElement: HTMLElement) {
    // 标记为展开
    liElement.setAttribute("isCollapsed", "false");

    // 展开下一级子标题
    const currentLevel = parseInt(liElement.getAttribute("data-level"));
    let nextSibling = liElement.nextElementSibling as HTMLElement;

    while (nextSibling) {
        const siblingLevel = parseInt(nextSibling.getAttribute("data-level"));
        if (siblingLevel === currentLevel + 1) {
            nextSibling.style.display = 'block';
        } else if (siblingLevel <= currentLevel) {
            // 如果遇到同级或更高级的标题，则说明处理完所有直接子标题了
            break;
        }
        nextSibling = nextSibling.nextElementSibling as HTMLElement;
    }
}

function collapseHeading(liElement: HTMLElement) {
    // 标记为已折叠
    liElement.setAttribute("isCollapsed", "true");

    // 折叠所有子标题
    const currentLevel = parseInt(liElement.getAttribute("data-level"));
    let nextSibling = liElement.nextElementSibling as HTMLElement;
    while (nextSibling && parseInt(nextSibling.getAttribute("data-level")) > currentLevel) {
        nextSibling.style.display = 'none'; // 隐藏子标题
        const isCollapsed = nextSibling.getAttribute("isCollapsed")
        if (isCollapsed !== null) {
            nextSibling.setAttribute("isCollapsed", "true"); // 标记为折叠状态
        }
        nextSibling = nextSibling.nextElementSibling as HTMLElement;
    }
}

