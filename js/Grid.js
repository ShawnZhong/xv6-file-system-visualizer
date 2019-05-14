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

        detailTitleDOM.innerText = activeElem.getTitle();
        detailContentDOM.innerHTML = '';


        detailContentDOM.appendChild(activeElem.detailDOM);

        relatedDOMList = activeElem.getRelatedDOM();
        relatedDOMList.forEach(e => e.classList.add("related"));
    }
}

class GridItem {
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
    getRelatedDOM() {
        return [];
    }

    /**
     * @returns {HTMLBaseElement}
     */
    getDetailDOM() {
    }


    initDOM() {
        this.detailDOM = this.getDetailDOM();

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
    }
}
