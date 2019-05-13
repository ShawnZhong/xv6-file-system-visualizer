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
        return ["Unused", "Directory", "File", "Device"][this.type];
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
        else if (dataBlocks.every(e => e.isBlockAscii))
            dataBlocks.forEach(e => e.belongsToTextFile = true);
        return dataBlocks;
    }

    getDataBlocksDOM() {
        const node = document.createElement("div");

        const title = document.createElement("h2");
        title.innerText = "Data Blocks";
        node.appendChild(title);

        if (this.dataAddresses.length !== 0) {
            this.dataBlocks.map(e => e.getDetailDOM()).forEach(e => node.appendChild(e));
        } else {
            const noDataBlocks = document.createElement("p");
            noDataBlocks.innerText = "This inode does not have any data blocks";
            node.appendChild(noDataBlocks);
        }
        return node;
    }


    getInodeSummaryDOM() {
        const node = document.createElement("div");

        const title = document.createElement("h2");
        title.innerText = "Inode Summary";
        node.appendChild(title);

        const type = document.createElement("p");
        type.innerText = "Type: " + this.typeName;
        node.appendChild(type);

        const nlink = document.createElement("p");
        nlink.innerText = "Number of links: " + this.nlink;
        node.appendChild(nlink);

        if (this.type === 3) {
            const major = document.createElement("p");
            major.innerText = "Major device number: " + this.major;
            node.appendChild(major);


            const minor = document.createElement("p");
            minor.innerText = "Minor device number: " + this.minor;
            node.appendChild(minor);
        }

        if (this.dataAddresses.length !== 0) {
            const dataAddresses = document.createElement("p");
            dataAddresses.innerText = "Data block addresses: " + this.dataAddresses.join(", ");
            node.appendChild(dataAddresses);
        }

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
        node.classList.add(this.typeName.toLowerCase() + "-inode");
        node.onmouseover = () => {
            detailContentDOM.innerHTML = this.getDetailDOM().innerHTML;
            node.classList.add("hover");
        };
        node.onmouseleave = () => node.classList.remove("hover");
        inodeContainerDOM.appendChild(node);
    }
}
