class GridUtils {
    static detailContentDOM = document.getElementById("detail-content");
    static detailTitleDOM = document.getElementById("detail-title");

    static hoveredElem;
    static selectedElem;
    static relatedElems;

    static enableHover = true;


    static showDetail() {
        GridUtils.detailTitleDOM.innerText = GridUtils.hoveredElem.getDetailTitleDOM().innerText;
        GridUtils.detailContentDOM.innerHTML = '';
        GridUtils.detailContentDOM.appendChild(GridUtils.hoveredElem.getDetailContentDOM());
    }

    static removeHovered() {
        if (GridUtils.hoveredElem)
            GridUtils.hoveredElem.gridDOM.classList.remove("hovered");
    }

    static removeSelected() {
        if (GridUtils.selectedElem)
            GridUtils.selectedElem.gridDOM.classList.remove("selected");
    }

    static removeRelated() {
        if (GridUtils.relatedElems)
            GridUtils.relatedElems.forEach(e => e.classList.remove("related"))
    }

    static setHovered(elem) {
        if (!GridUtils.enableHover) return;
        GridUtils.removeHovered();
        GridUtils.removeRelated();

        GridUtils.hoveredElem = elem;
        GridUtils.relatedElems = elem.getRelatedGrid().map(e => e.gridDOM);

        elem.gridDOM.classList.add("hovered");
        GridUtils.relatedElems.forEach(e => e.classList.add("related"));


        GridUtils.showDetail();
    }

    static setSelected(elem) {
        if (!GridUtils.enableHover) {
            GridUtils.enableHover = true;
            GridUtils.removeSelected();
            return;
        }

        GridUtils.removeSelected();
        GridUtils.removeHovered();
        GridUtils.removeRelated();

        GridUtils.enableHover = false;
        elem.gridDOM.classList.add("selected");


        GridUtils.selectedElem = elem;

        GridUtils.showDetail();
    }
}

class Grid {
    /**
     * @type {HTMLBaseElement}
     */
    container;

    /**
     * @type {HTMLDivElement}
     */
    gridDOM;

    /**
     * @returns {HTMLBaseElement}
     */
    getDetailContentDOM() {
        // implemented by child class
    }

    /**
     * @returns {HTMLBaseElement}
     */
    getDetailTitleDOM() {
        // implemented by child class
    }

    /**
     * @return  {string}
     */
    getClassName() {
        // implemented by child class
    }


    /**
     * @returns {Grid[]}
     */
    getRelatedGrid() {
        return [];
    }

    /**
     * @returns {HTMLDivElement} an element in the grid
     */
    initGridDOM() {
        if (this.gridDOM) return this.gridDOM;
        this.gridDOM = document.createElement("div");
        this.gridDOM.classList.add(this.getClassName());

        this.gridDOM.onmouseover = () => GridUtils.setHovered(this);
        this.gridDOM.onclick = () => GridUtils.setSelected(this);

        return this.gridDOM;
    }
}