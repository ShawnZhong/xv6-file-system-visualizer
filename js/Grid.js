class GridUtils {
    static detailContentDOM = document.getElementById("detail-content");
    static detailTitleDOM = document.getElementById("detail-title");

    static activeElem;
    static relatedElems;

    static enableHover = true;


    static setActive(activeElem) {
        if (GridUtils.activeElem)
            GridUtils.activeElem.gridDOM.classList.remove("hovered", "selected");
        if (GridUtils.relatedElems)
            GridUtils.relatedElems.forEach(e => e.classList.remove("related"));

        GridUtils.activeElem = activeElem;

        GridUtils.detailTitleDOM.innerText = GridUtils.activeElem.getDetailTitleDOM().innerText;
        GridUtils.detailContentDOM.innerHTML = '';
        GridUtils.detailContentDOM.appendChild(GridUtils.activeElem.detailContentDOM);

        GridUtils.relatedElems = GridUtils.activeElem.getRelatedGrid().map(e => e.gridDOM);
        GridUtils.relatedElems.forEach(e => e.classList.add("related"));
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
            if (!GridUtils.enableHover) return;
            GridUtils.setActive(this);
            GridUtils.activeElem.gridDOM.classList.add("hovered");
        };
        this.gridDOM.onclick = () => {
            GridUtils.enableHover = !GridUtils.enableHover;
            GridUtils.setActive(this);
            GridUtils.activeElem.gridDOM.classList.add(GridUtils.enableHover ? "hovered" : "selected");
        };

        return this.gridDOM;
    }
}