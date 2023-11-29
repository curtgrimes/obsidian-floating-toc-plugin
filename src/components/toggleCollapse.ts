// 判断是否存在子标题
export function hasChildHeading(headingIndex: number, allHeadings: any) {
   
    return headingIndex + 1 < allHeadings.length 
            ?  allHeadings[headingIndex + 1].level > allHeadings[headingIndex].level
            : false;
}

export function toggleCollapse(e: MouseEvent, li: HTMLElement) {
    e.stopPropagation();
    const isCollapsed = li.getAttribute("isCollapsed");
 
    if (isCollapsed !== null) {
      if (isCollapsed === "true") {
        expandHeading(li);
      } else if (isCollapsed === "false") {
        collapseHeading(li);
      }
    }
  }
  
  // 展开当前标题的子标题
  function expandHeading(liElement: HTMLElement) {
    // 标记为展开
    liElement.setAttribute("isCollapsed", "false");
  
    // 展开下一级子标题
    const currentLevel = parseInt(liElement.getAttribute("data-level"));
    let nextSibling = liElement.nextElementSibling as HTMLElement;
    while (nextSibling) {
      const siblingLevel = parseInt(nextSibling.getAttribute("data-level"));
      if (siblingLevel > currentLevel) {
        nextSibling.style.display = 'block';
        const isCollapsed = nextSibling.getAttribute("isCollapsed");
        if (isCollapsed === "true") {
          expandHeading(nextSibling); // 递归展开子标题的子标题
        }
      } else if (siblingLevel <= currentLevel) {
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
      nextSibling.style.display = 'none';
      const isCollapsed = nextSibling.getAttribute("isCollapsed");
      if (isCollapsed !== null) {
        nextSibling.setAttribute("isCollapsed", "true");
      }
      nextSibling = nextSibling.nextElementSibling as HTMLElement;
    }
  }
