class FileTree {
    static init() {
        this.entryList = [];
        this.initRoot();
        this.traverse(this.root);
    }

    static initRoot() {
        this.root = {
            inum: 1,
            indentation: -1,
            path: ""
        };
        inodeList[1].pathList.push("/");
    }

    static traverse(parent) {
        const entries = inodeList[parent.inum].entries;

        // make sure that "." and ".." appears first
        if (entries["."])
            this.entryList.push(new Entry(".", entries["."], parent));

        if (entries[".."])
            this.entryList.push(new Entry("..", entries[".."], parent));

        for (const [name, inum] of Object.entries(entries)) {
            if (name === '.' || name === '..') continue;

            const entry = new Entry(name, inum, parent);
            this.entryList.push(entry);

            if (inodeList[inum].type === 1)
                this.traverse(entry);
        }

    }

    static render() {
        Elements.fileTreeContent.innerHTML = '';
        this.entryList.forEach(e => Elements.fileTreeContent.appendChild(e.getElement()));
    }
}


class Entry {
    constructor(name, inum, parent) {
        this.name = name;
        this.inum = inum;
        this.inode = inodeList[inum];

        this.indentation = parent.indentation + 1;
        this.path = parent.path + "/" + name;

        if (name !== '.' && name !== '..')
            this.inode.pathList.push(this.path);
    }

    getElement() {
        if (this.element) return this.element;

        this.element = document.createElement("pre");
        this.element.innerText = `${this.name} → ${this.inum}`;

        if (this.indentation)
            this.element.style.marginLeft = this.indentation + "em";

        this.element.onmouseover = this.inode.gridElement.onmouseover;
        this.element.onclick = this.inode.gridElement.onclick;
        this.inode.fileTreeDOMList.push(this.element);

        return this.element;
    }
}