class GridUtils {
    static detailContentDOM = document.getElementById("detail-content");
    static detailTitleDOM = document.getElementById("detail-title");

    static hoveredElem;
    static selectedElem;
    static relatedElems;

    static enableHover = true;


    static clear() {
        if (GridUtils.hoveredElem)
            GridUtils.hoveredElem.gridDOM.classList.remove("hovered");
        if (GridUtils.selectedElem)
            GridUtils.selectedElem.gridDOM.classList.remove("selected");
        if (GridUtils.relatedElems)
            GridUtils.relatedElems.forEach(e => e.classList.remove("related"))
    }

    static focus() {
        GridUtils.detailTitleDOM.innerText = GridUtils.hoveredElem.getDetailTitleDOM().innerText;
        GridUtils.detailContentDOM.innerHTML = '';
        GridUtils.detailContentDOM.appendChild(GridUtils.hoveredElem.detailContentDOM);

        GridUtils.relatedElems.forEach(e => e.classList.add("related"));
    }


    static setHovered() {
        if (!GridUtils.enableHover) return;

        GridUtils.hoveredElem.gridDOM.classList.add("hovered");
        GridUtils.focus();
    }

    static setSelected() {
        GridUtils.enableHover = !GridUtils.enableHover;
        if (GridUtils.enableHover) return;

        GridUtils.selectedElem.gridDOM.classList.add("selected");
        GridUtils.focus();
    }
}

class Grid {
    /**
     * @type {HTMLDivElement}
     */
    gridDOM;

    /**
     * @type {HTMLBaseElement}
     */
    detailContentDOM;

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
        if (!this.detailContentDOM) this.detailContentDOM = this.getDetailContentDOM();
        if (this.gridDOM) return this.gridDOM;
        this.gridDOM = document.createElement("div");
        this.gridDOM.classList.add(this.getClassName());

        this.gridDOM.onmouseover = () => {
            GridUtils.clear();
            GridUtils.hoveredElem = this;
            GridUtils.relatedElems = this.getRelatedGrid().map(e => e.gridDOM);
            GridUtils.setHovered();
        };
        this.gridDOM.onclick = () => {
            GridUtils.clear();
            GridUtils.selectedElem = this;
            GridUtils.relatedElems = this.getRelatedGrid().map(e => e.gridDOM);
            GridUtils.setSelected()
        };

        return this.gridDOM;
    }
}