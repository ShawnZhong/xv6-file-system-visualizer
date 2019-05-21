const detailContentDOM = document.getElementById("detail-content");
const detailTitleDOM = document.getElementById("detail-title");

let enableHover = true;

let activeElem;
let relatedDOMList;

class GridUtils {
    static setActive(newActiveElem) {
        if (activeElem)
            activeElem.gridElement.classList.remove("hovered", "selected");
        if (relatedDOMList)
            relatedDOMList.forEach(e => e.classList.remove("related"));

        activeElem = newActiveElem;

        detailTitleDOM.innerText = activeElem.getTitle();
        detailContentDOM.innerHTML = '';


        if (!activeElem.detailDOM) activeElem.detailDOM = activeElem.getDetailElement();
        detailContentDOM.appendChild(activeElem.detailDOM);

        relatedDOMList = activeElem.getRelatedDOMList();
        relatedDOMList.forEach(e => e.classList.add("related"));
    }
}

class GridItem {
    constructor() {
        this.gridText = '-';
    }


    /**
     * @returns {string}
     */
    getTitle() {
    }

    /**
     * @return  {string}
     */
    getClassName() {
    }

    /**
     * @returns {HTMLBaseElement[]}
     */
    getRelatedDOMList() {
        return [];
    }

    /**
     * @returns {HTMLBaseElement}
     */
    getDetailElement() {
    }


    getGridElement() {
        if (this.gridElement) return this.gridElement;

        this.gridElement = document.createElement("div");

        this.gridElement.classList.add(this.getClassName());
        this.gridElement.innerHTML = this.gridText;

        this.gridElement.onmouseover = () => {
            if (!enableHover) return;
            GridUtils.setActive(this);
            activeElem.gridElement.classList.add("hovered");
        };

        this.gridElement.onclick = () => {
            enableHover = !enableHover;
            GridUtils.setActive(this);
            activeElem.gridElement.classList.add(enableHover ? "hovered" : "selected");
        };

        return this.gridElement;
    }
}
