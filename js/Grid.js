const detailContent = document.getElementById("detail-content");
const detailTitle = document.getElementById("detail-title");

class Grid {
    static currentHoveredItem;

    /**
     * @type {HTMLBaseElement}
     */
    container;

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
        const node = document.createElement("div");
        node.classList.add(this.getClassName());
        node.onmouseover = () => {
            if (Grid.currentHoveredItem)
                Grid.currentHoveredItem.classList.remove("selected");
            detailTitle.innerText = this.getDetailTitleDOM().innerText;
            detailContent.innerHTML = '';
            detailContent.appendChild(this.getDetailContentDOM());
            node.classList.add("selected");
            Grid.currentHoveredItem = node;
        };

        this.gridDOM = node;

        return node;
    }
}