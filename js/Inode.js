class Inode {
    constructor(inum) {
        this.inum = inum;
        this.inode = new DataView(image, Config.blockSize * 2 + inum * Config.inodeSize);

        this.type = this.inode.getUint16(0, true);
        this.major = this.inode.getUint16(2, true);
        this.minor = this.inode.getUint16(4, true);
        this.nlink = this.inode.getUint16(6, true);
        this.size = this.inode.getUint32(8, true);

        this.indirectAddress = this.inode.getUint32(12 + Config.numberOfDirectAddress * 4, true);
        this.dataAddresses = this.getAddresses();
        this.typeName = this.getTypeName();
        this.dataBlocks = this.getDataBlocks();

    }

    getTypeName() {
        if (this.type > 3) return "Unknown";
        return ["unused", "directory", "file", "device"][this.type];
    }

    getAddresses() {
        const numberOfAddresses = (this.size + Config.blockSize - 1) / Config.blockSize;
        let addresses = new Uint32Array(numberOfAddresses);

        // direct addresses
        for (let i = 0; i < Config.numberOfDirectAddress; i++)
            addresses[i] = this.inode.getUint32(12 + i * 4, true);

        // indirect addresses
        if (numberOfAddresses > Config.numberOfDirectAddress) {
            const indirectBlock = new Block(this.indirectAddress).block;
            for (let i = 0; i < numberOfAddresses - Config.numberOfDirectAddress - 1; i++)
                addresses[Config.numberOfDirectAddress + i] = indirectBlock.getUint32(i * 4, true);
        }

        return addresses;
    }

    getDataBlocks() {
        const dataBlocks = Array.from(this.dataAddresses).map(i => blocks[i]);
        if (this.type === 1)
            dataBlocks.forEach(e => e.isDirectoryBlock = true);
        else if (dataBlocks.every(e => e.isBlockAscii()))
            dataBlocks.forEach(e => e.isTextFile = true);
        return dataBlocks;
    }

    getDataBlocksDOM() {
        const node = document.createElement("div");
        this.dataBlocks.map(e => e.getDetailDOM()).forEach(e => node.appendChild(e));
        return node;
    }


    getInodeSummaryDOM() {
        const node = document.createElement("div");
        node.innerHTML =
            `type = ${this.type}, dataAddresses = ${this.dataAddresses}
        `;
        return node;
    }

    getDetailDOM() {
        const node = document.createElement("div");
        node.appendChild(this.getInodeSummaryDOM());
        node.appendChild(this.getDataBlocksDOM());
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
