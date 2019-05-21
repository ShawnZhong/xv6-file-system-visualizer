class FileTree {
    static init() {
        this.entryList = [];
        this.DOM = document.getElementById("file-tree-content");
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
        this.DOM.innerHTML = '';
        this.entryList.forEach(e => e.initDOM());
        this.entryList.forEach(e => this.DOM.appendChild(e.DOM));
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

    initDOM() {
        this.DOM = document.createElement("pre");
        this.DOM.innerText = `${this.name} → ${this.inum}`;
        if (this.indentation) this.DOM.style.marginLeft = this.indentation + "em";
        this.DOM.onmouseover = this.inode.gridDOM.onmouseover;
        this.DOM.onclick = this.inode.gridDOM.onclick;
        this.inode.fileTreeDOMList.push(this.DOM);
    }
}