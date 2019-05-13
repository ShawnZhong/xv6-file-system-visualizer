const detailContentDOM = document.getElementById("detail-content");
const detailTitleDOM = document.getElementById("detail-title");

let enableHover = true;

let activeElem;
let relatedDOMList;

class GridUtils {
    static setActive(newActiveElem) {
        if (activeElem)
            activeElem.gridDOM.classList.remove("hovered", "selected");
        if (relatedDOMList)
            relatedDOMList.forEach(e => e.classList.remove("related"));

        activeElem = newActiveElem;

        detailTitleDOM.innerText = activeElem.getDetailTitleDOM().innerText;
        detailContentDOM.innerHTML = '';
        detailContentDOM.appendChild(activeElem.detailContentDOM);

        relatedDOMList = activeElem.getRelatedDOM();
        relatedDOMList.forEach(e => e.classList.add("related"));
    }
}

class Grid {
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
    getRelatedDOM() {
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
            if (!enableHover) return;
            GridUtils.setActive(this);
            activeElem.gridDOM.classList.add("hovered");
        };
        
        this.gridDOM.onclick = () => {
            enableHover = !enableHover;
            GridUtils.setActive(this);
            activeElem.gridDOM.classList.add(enableHover ? "hovered" : "selected");
        };

        return this.gridDOM;
    }
}