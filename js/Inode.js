class Inode {
    static SIZE = 64;
    static NDIRECT = 12;

    constructor(inum) {
        this.inum = inum;
        this.inode = new DataView(image, Block.SIZE * 2 + inum * Inode.SIZE);

        this.type = this.inode.getUint16(0, true);
        this.major = this.inode.getUint16(2, true);
        this.minor = this.inode.getUint16(4, true);
        this.nlink = this.inode.getUint16(6, true);
        this.size = this.inode.getUint32(8, true);

        this.indirectAddress = this.inode.getUint32(12 + Inode.NDIRECT * 4, true);
        this.dataAddresses = this.getAddresses();
        this.typeName = this.getTypeName();
    }

    getAddresses() {
        const numberOfAddresses = (this.size + Block.SIZE - 1) / Block.SIZE;
        let addresses = new Uint32Array(numberOfAddresses);

        // direct addresses
        for (let i = 0; i < Inode.NDIRECT; i++)
            addresses[i] = this.inode.getUint32(12 + i * 4, true);

        // indirect addresses
        if (numberOfAddresses > Inode.NDIRECT) {
            const indirectBlock = new Block(this.indirectAddress).block;
            for (let i = 0; i < numberOfAddresses - Inode.NDIRECT - 1; i++)
                addresses[Inode.NDIRECT + i] = indirectBlock.getUint32(i * 4, true);
        }

        return addresses;
    }

    getTypeName() {
        if (this.type > 3) return "Unknown";
        return ["unused", "directory", "file", "device"][this.type];
    }

    getDirectoryDOM() {
        const entries = Array.from(this.dataAddresses)
            .map(e => new DirectoryBlock(e).getEntries())
            .reduce((accumulator, currentValue) => Object.assign(accumulator, currentValue), {});

        const bodyDOM = document.createElement("div");
        bodyDOM.innerHTML = Object.entries(entries).map(([name, inum]) => `${name} => ${inum}`).join("<br>");
        return bodyDOM;
    }


    getFileDOM() {
        const blocks = Array.from(this.dataAddresses).map(e => new Block(e));
        const bodyDOM = document.createElement("div");
        if (blocks.every(e => e.isAscii()))
            bodyDOM.innerHTML = blocks.map(e => e.getData(0)).toString();
        else
            bodyDOM.innerHTML = blocks.map(e => e.getData(16)).toString();

        return bodyDOM;
    }

    getDetailDOM() {
        const node = document.createElement("div");
        if (this.type === 1 && this.size !== 0)
            node.appendChild(this.getDirectoryDOM());
        else if (this.type === 2)
            node.appendChild(this.getFileDOM());

        return node;
    }


    renderGrid() {
        const node = document.createElement("div");
        node.classList.add(this.typeName + "-inode");
        node.setAttribute("inum", this.inum);
        node.onmouseover = () => detailContentDOM.innerHTML = this.getDetailDOM().innerHTML;
        inodeContainerDOM.appendChild(node);
    }
}
