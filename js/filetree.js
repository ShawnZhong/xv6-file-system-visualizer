class FileTree {
    static init() {
        this.entryList = [];
        this.element = document.getElementById("file-tree-content");
        this.initRoot();
        this.traverse(this.root);
    }

    static initRoot() {
        this.root = {
            inum: 1,
            indentation: -2,
            path: ""
        };
        inodeList[1].pathList.push("/");
    }

    static traverse(parent) {
        const directory = inodeList[parent.inum].directoryList;
        for (const [name, inum] of Object.entries(directory)) {
            const entry = new Entry(name, inum, parent);
            this.entryList.push(entry);
            if (inodeList[inum].type === 1 && name !== '.' && name !== '..')
                this.traverse(entry);
        }

    }

    static render() {
        this.element.innerHTML = '';
        this.entryList.forEach(e => this.element.appendChild(e.getElement()));
    }
}


class Entry {
    constructor(name, inum, parent) {
        this.name = name;
        this.inum = inum;
        this.inode = inodeList[inum];

        this.indentation = parent.indentation + 2;
        this.path = parent.path + "/" + name;

        if (name !== '.' && name !== '..')
            this.inode.pathList.push(this.path);
    }

    getElement() {
        if (this.element) return this.element;

        this.element = document.createElement("pre");
        this.element.innerText = `${this.name} → ${this.inum}`;
        if (this.indentation) this.element.style.marginLeft = this.indentation + "em";
        this.element.onmouseover = this.inode.gridDOM.onmouseover;
        this.element.onclick = this.inode.gridDOM.onclick;
        this.inode.fileTreeDOMList.push(this.element);

        return this.element;
    }
}