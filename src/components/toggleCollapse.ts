export function toggleCollapse(liElement: HTMLElement) {
    event.stopPropagation();
    const isCollapsed = liElement.classList.contains("collapsed");

    if (isCollapsed) {
        expandHeading(liElement);
    } else {
        collapseHeading(liElement);
    }
}

// 仅展开当前标题的直接子标题
function expandHeading(liElement: HTMLElement) {
    // 标记为展开
    liElement.classList.remove("collapsed");

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
    liElement.classList.add("collapsed");

    // 折叠所有子标题
    const currentLevel = parseInt(liElement.getAttribute("data-level"));
    let nextSibling = liElement.nextElementSibling as HTMLElement;
    while (nextSibling && parseInt(nextSibling.getAttribute("data-level")) > currentLevel) {
        nextSibling.style.display = 'none'; // 隐藏子标题
        nextSibling.classList.add("collapsed"); // 标记为折叠状态
        nextSibling = nextSibling.nextElementSibling as HTMLElement;
    }
}