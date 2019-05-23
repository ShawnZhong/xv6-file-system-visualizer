class Grid {
    static init() {
        Grid.enableHover = true;
        Elements.fileTreePanel.onclick = Grid.resetHover;
        Elements.gridColumn.onclick = Grid.resetHover;
    }

    static setActive(newActiveElem) {
        Grid.removeOldActiveElem();
        Grid.activeElem = newActiveElem;
        Grid.setDetailContent();
        Grid.showRelated();
    }

    static resetHover() {
        Grid.enableHover = true;
        Grid.removeOldActiveElem();
    }

    static removeOldActiveElem() {
        if (Grid.activeElem)
            Grid.activeElem.gridElement.classList.remove("hovered", "selected");
        if (Grid.relatedDOMList)
            Grid.relatedDOMList.forEach(e => e.classList.remove("related"));
        Elements.blockContainer.classList.remove("not-selected");
        Elements.inodeContainer.classList.remove("not-selected");
        Elements.fileTreeContent.classList.remove("not-selected")
    }

    static setDetailContent() {
        Elements.detailTitle.innerText = Grid.activeElem.getTitle();

        if (!Grid.activeElem.detailDOM) Grid.activeElem.detailDOM = Grid.activeElem.getDetailElement();
        Elements.detailContent.innerHTML = '';
        Elements.detailContent.appendChild(Grid.activeElem.detailDOM);
    }

    static showRelated() {
        Grid.relatedDOMList = Grid.activeElem.getRelatedDOMList();
        Grid.relatedDOMList.forEach(e => e.classList.add("related"));
    }

    static setHovered() {
        Grid.activeElem.gridElement.classList.add("hovered");
    }

    static setClicked() {
        Grid.activeElem.gridElement.classList.add("selected");
        Elements.blockContainer.classList.add("not-selected");
        Elements.inodeContainer.classList.add("not-selected");
        Elements.fileTreeContent.classList.add("not-selected")
    }
}

class GridItem {
    getTitle() {
    }

    getClassName() {
    }

    getRelatedDOMList() {
        return [];
    }

    getDetailElement() {
    }

    checkError() {
        return false;
    }

    getGridText() {
        return '-';
    }


    getGridElement() {
        if (this.gridElement) return this.gridElement;

        this.gridElement = document.createElement("div");

        this.error = this.checkError();

        if (this.error) {
            this.gridElement.classList.add("error");
            this.gridElement.innerHTML = "?";
        } else {
            this.gridElement.classList.add(this.getClassName());
            this.gridElement.innerHTML = this.getGridText();
        }

        this.gridElement.onmouseover = (e) => {
            if (!Grid.enableHover) return;
            Grid.setActive(this);
            Grid.setHovered();

            if (e) e.stopPropagation();
        };

        this.gridElement.onclick = (e) => {
            Grid.enableHover = !Grid.enableHover;
            Grid.setActive(this);

            if (Grid.enableHover)
                Grid.setHovered();
            else
                Grid.setClicked();

            if (e) e.stopPropagation();
        };

        return this.gridElement;
    }

    getErrorElement() {
        const node = document.createElement("div");

        if (!this.error) return node;

        const errorTitle = document.createElement("h4");
        errorTitle.innerText = `Error: `;
        node.appendChild(errorTitle);

        const error = document.createElement("p");
        error.innerText = this.error;
        node.appendChild(error);

        return node;
    }
}