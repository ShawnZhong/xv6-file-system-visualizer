class GridUtils {
    static detailContentDOM = document.getElementById("detail-content");
    static detailTitleDOM = document.getElementById("detail-title");

    static currentHovered;
    static currentSelectedItem;

    static enableHover = true;


    static showDetail(elem) {
        GridUtils.detailTitleDOM.innerText = elem.getDetailTitleDOM().innerText;
        GridUtils.detailContentDOM.innerHTML = '';
        GridUtils.detailContentDOM.appendChild(elem.getDetailContentDOM());
    }

    static removeHovered() {
        if (GridUtils.currentHovered)
            GridUtils.currentHovered.gridDOM.classList.remove("hovered");
    }

    static removeSelected() {
        if (GridUtils.currentSelectedItem)
            GridUtils.currentSelectedItem.gridDOM.classList.remove("selected");
    }

    static setHovered(elem) {
        if (!GridUtils.enableHover) return;
        GridUtils.removeHovered();

        elem.gridDOM.classList.add("hovered");
        GridUtils.currentHovered = elem;

        GridUtils.showDetail(elem);
    }

    static setSelected(elem) {
        if (!GridUtils.enableHover) {
            GridUtils.enableHover = true;
            GridUtils.removeSelected();
            return;
        }
        
        GridUtils.removeSelected();

        elem.gridDOM.classList.add("selected");
        GridUtils.currentSelectedItem = elem;

        GridUtils.enableHover = false;
        GridUtils.removeHovered();

        GridUtils.showDetail(elem);
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
     * @returns {HTMLDivElement} an element in the grid
     */
    getGridDOM() {
        this.gridDOM = document.createElement("div");
        this.gridDOM.classList.add(this.getClassName());

        this.gridDOM.onmouseover = () => GridUtils.setHovered(this);
        this.gridDOM.onclick = () => GridUtils.setSelected(this);

        return this.gridDOM;
    }
}