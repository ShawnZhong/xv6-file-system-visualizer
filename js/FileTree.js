const fileTreeContent = document.getElementById("file-tree-content");

class FileTree {
    constructor() {
        this.directoryList = inodeList.map(inode =>
            inode.type === 1 ? Object.assign({}, ...inode.dataBlocks.map(block => block.getEntries())) : null
        );

    }

    traverse(directoryNumber, indentation) {
        const directory = this.directoryList[directoryNumber];
        for (const [name, inum] of Object.entries(directory)) {
            const node = document.createElement("div");
            node.innerText = `${' '.repeat(indentation)}${name} → ${inum}`;
            fileTreeContent.appendChild(node);


            if (inodeList[inum].type === 1 && name !== '.' && name !== '..') {
                this.traverse(inum, indentation + 4);
            }
        }


    }

    render() {
        fileTreeContent.innerHTML = '';
        this.traverse(1, 0);
    }
}