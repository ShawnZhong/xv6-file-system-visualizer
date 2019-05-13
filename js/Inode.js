class Inode extends Grid {
    container = inodeContainer;

    constructor(inum) {
        super();
        this.inum = inum;
        this.inode = new DataView(image, Config.blockSize * 2 + inum * Config.inodeSize, Config.inodeSize);

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

    getClassName() {
        return this.typeName.toLowerCase() + "-inode";
    }

    getAddresses() {
        const numberOfAddresses = (this.size + Config.blockSize - 1) / Config.blockSize;
        let addresses = new Uint32Array(numberOfAddresses);

        // direct addresses
        for (let i = 0; i < Config.numberOfDirectAddress; i++)
            addresses[i] = this.inode.getUint32(12 + i * 4, true);

        // indirect addresses
        if (numberOfAddresses > Config.numberOfDirectAddress) {
            const indirectBlock = blockList[this.indirectAddress].dataView;
            for (let i = 0; i < numberOfAddresses - Config.numberOfDirectAddress - 1; i++)
                addresses[Config.numberOfDirectAddress + i] = indirectBlock.getUint32(i * 4, true);
        }

        return addresses;
    }

    getDataBlocks() {
        const dataBlocks = Array.from(this.dataAddresses).map(i => blockList[i]);
        if (this.type === 1)
            dataBlocks.forEach(e => e.isDirectoryBlock = true);
        else if (dataBlocks.every(e => e.isBlockAscii()))
            dataBlocks.forEach(e => e.belongsToTextFile = true);
        return dataBlocks;
    }

    getDetailContentDOM() {
        const node = document.createElement("div");


        // size
        if (this.type === 1 || this.type === 2) {
            const size = document.createElement("p");
            size.innerText = "Size: " + this.size;
            node.appendChild(size);
        }


        // nlink
        if (this.type !== 0) {
            const nlink = document.createElement("p");
            nlink.innerText = "Number of links: " + this.nlink;
            node.appendChild(nlink);
        }


        // nblock
        if (this.type === 1 || this.type === 2) {
            const nblock = document.createElement("p");
            nblock.innerText = "Number of data blocks: " + this.dataAddresses.length;
            node.appendChild(nblock);
        }


        // device only
        if (this.type === 3) {
            const major = document.createElement("p");
            major.innerText = "Major device number: " + this.major;
            node.appendChild(major);


            const minor = document.createElement("p");
            minor.innerText = "Minor device number: " + this.minor;
            node.appendChild(minor);
        }

        // data addresses
        if (this.dataAddresses.length !== 0) {
            const dataAddresses = document.createElement("p");
            dataAddresses.innerText = "Data block addresses: " + this.dataAddresses.join(", ");
            node.appendChild(dataAddresses);
        }

        // data blocks
        for (let dataBlock of this.dataBlocks) {
            node.appendChild(dataBlock.getDetailTitleDOM());
            node.appendChild(dataBlock.getDetailContentDOM());
        }

        return node;
    }

    getDetailTitleDOM() {
        const node = document.createElement("h3");
        node.innerText = `Inode ${this.inum}: ${this.typeName}`;
        return node;
    }
}
