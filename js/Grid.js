const inodeContainer = document.getElementById("inode-container");
const blockContainer = document.getElementById("block-container");

const detailContent = document.getElementById("detail-content");
const detailTitle = document.getElementById("detail-title");

let currentHoveredItem;

class Grid {
    /**
     * @type {HTMLBaseElement}
     */
    container;

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

    renderGrid() {
        const node = document.createElement("div");
        node.classList.add(this.getClassName());
        node.onmouseover = () => {
            if (currentHoveredItem)
                currentHoveredItem.classList.remove("selected");
            detailTitle.innerText = this.getDetailTitleDOM().innerText;
            detailContent.innerHTML = '';
            detailContent.appendChild(this.getDetailContentDOM());
            node.classList.add("selected");
            currentHoveredItem = node;
        };
        this.container.appendChild(node);
    }
}