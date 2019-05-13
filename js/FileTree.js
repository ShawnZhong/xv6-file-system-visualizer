class FileTree {
    static render() {
        this.fileTreeDOM = document.getElementById("file-tree-content");
        this.fileTreeDOM.innerHTML = '';
        inodeList[1].pathList.push('/');
        this.traverse();
    }

    static traverse(parentInum = 1, parentPath = '', indentation = 0) {
        const directory = inodeList[parentInum].directoryList;
        for (const [name, inum] of Object.entries(directory)) {
            this.fileTreeDOM.innerText += `${' '.repeat(indentation)}${name} → ${inum} \n`;

            if (name === '.' || name === '..') continue;

            const path = parentPath + "/" + name;
            inodeList[inum].pathList.push(path);
            if (inodeList[inum].type === 1)
                this.traverse(inum, path, indentation + 4);
        }

    }
}