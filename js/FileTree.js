class FileTree {
    static directoryList;
    static fileTreeDOM = document.getElementById("file-tree-content");

    static render() {
        this.directoryList = inodeList.map(inode =>
            inode.type === 1 ? Object.assign({}, ...inode.dataBlocks.map(block => block.getEntries())) : null
        );

        this.fileTreeDOM.innerHTML = '';
        this.traverse(1, 0);
    }

    static traverse(directoryNumber, indentation) {
        const directory = this.directoryList[directoryNumber];
        for (const [name, inum] of Object.entries(directory)) {
            const node = document.createElement("div");
            node.innerText = `${' '.repeat(indentation)}${name} → ${inum}`;
            this.fileTreeDOM.appendChild(node);

            if (inodeList[inum].type === 1 && name !== '.' && name !== '..') {
                this.traverse(inum, indentation + 4);
            }
        }

    }
}