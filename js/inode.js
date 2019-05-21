let inodeList;

class InodeUtils {
    static render() {
        const container = document.getElementById("inode-container");
        container.innerHTML = "";
        inodeList.forEach(e => container.appendChild(e.getGridElement()));
    }

    static init() {
        inodeList = Array.from(new Array(superBlock.ninodes).keys(), i => new Inode(i));
    }

    static getTypeName(type) {
        if (type > 3) return "Unknown";
        return ["Unused", "Directory", "File", "Device"][type];
    }
}


class Inode extends GridItem {
    constructor(inum) {
        super();

        this.inum = inum;
        this.inode = new DataView(image, Config.blockSize * 2 + inum * Config.inodeSize, Config.inodeSize);

        this.type = this.inode.getUint16(0, true);
        this.major = this.inode.getUint16(2, true);
        this.minor = this.inode.getUint16(4, true);
        this.nlink = this.inode.getUint16(6, true);
        this.size = this.inode.getUint32(8, true);

        this.typeName = InodeUtils.getTypeName(this.type);
        this.gridText = this.getGridText();
        this.pathList = [];
        this.fileTreeDOMList = [];


        // init addresses
        const numberOfAddresses = Math.floor((this.size + Config.blockSize - 1) / Config.blockSize);
        this.dataAddresses = [];
        this.allAddresses = [];

        for (let i = 0; i < Config.numberOfDirectAddress && i < numberOfAddresses; i++) {
            const address = this.inode.getUint32(12 + i * 4, true);
            this.dataAddresses.push(address);
            this.allAddresses.push(address);
        }

        if (numberOfAddresses > Config.numberOfDirectAddress) {
            const indirectAddress = this.inode.getUint32(12 + Config.numberOfDirectAddress * 4, true);
            const indirectBlock = blockList[indirectAddress].dataView;
            this.allAddresses.push(indirectAddress);
            for (let i = 0; i < numberOfAddresses - Config.numberOfDirectAddress; i++) {
                const address = indirectBlock.getUint32(i * 4, true);
                this.dataAddresses.push(address);
                this.allAddresses.push(address);
            }
        }


        // init blocks
        this.dataBlocks = this.dataAddresses.map(i => blockList[i]);
        this.allBlocks = this.allAddresses.map(i => blockList[i]);
        this.allBlocks.forEach(e => e.inode = this);

        if (this.type === 1) {
            this.dataBlocks.forEach(e => e.isDirectoryBlock = true);
            this.directoryList = Object.assign({}, ...this.dataBlocks.map(block => block.getEntries()));
        } else if (this.dataBlocks.every(e => e.isBlockAscii()))
            this.dataBlocks.forEach(e => e.belongsToTextFile = true);
    }

    getGridText() {
        if (this.type > 3) return "U";
        return ["-", "D", "F", "S"][this.type];
    }

    getDetailElement() {
        if (this.detailElement) return this.detailElement;


        this.detailElement = document.createElement("div");
        if (this.type === 0) return this.detailElement;

        //title
        const title = document.createElement("h4");
        title.innerText = `Basic information: `;
        this.detailElement.appendChild(title);

        // path
        if (this.pathList.length !== 0) {
            const path = document.createElement("p");
            path.innerText = "Path: " + this.pathList.join(", ");
            this.detailElement.appendChild(path);
        }

        // size
        if (this.type === 1 || this.type === 2) {
            const size = document.createElement("p");
            size.innerText = "Size: " + this.size;
            this.detailElement.appendChild(size);
        }

        // nlink
        if (this.type !== 0) {
            const nlink = document.createElement("p");
            nlink.innerText = "Number of links: " + this.nlink;
            this.detailElement.appendChild(nlink);
        }

        // nblock
        if (this.type === 1 || this.type === 2) {
            const nblock = document.createElement("p");
            nblock.innerText = "Number of data blocks: " + this.dataAddresses.length;
            this.detailElement.appendChild(nblock);
        }

        // device only
        if (this.type === 3) {
            const major = document.createElement("p");
            major.innerText = "Major device number: " + this.major;
            this.detailElement.appendChild(major);


            const minor = document.createElement("p");
            minor.innerText = "Minor device number: " + this.minor;
            this.detailElement.appendChild(minor);
        }

        // data addresses
        if (this.allAddresses.length !== 0) {
            const dataAddresses = document.createElement("p");
            dataAddresses.innerText = "Data block addresses: " + this.dataAddresses.join(", ");
            this.detailElement.appendChild(dataAddresses);
        }

        // indirect address
        if (this.dataAddresses.length > Config.numberOfDirectAddress) {
            const indirectAddress = document.createElement("p");
            indirectAddress.innerText = "Indirect block address: " + this.allAddresses[Config.numberOfDirectAddress];
            this.detailElement.appendChild(indirectAddress);
        }

        // data blocks
        for (let dataBlock of this.dataBlocks) {
            const title = document.createElement("h4");
            title.innerText = `Block ${dataBlock.blockNumber}:`;
            this.detailElement.appendChild(title);

            this.detailElement.appendChild(dataBlock.getDataElement());
        }

        return this.detailElement;
    }

    getClassName() {
        return this.typeName.toLowerCase() + "-inode";
    }

    getRelatedDOMList() {
        return [...this.allBlocks.map(e => e.gridElement), ...this.fileTreeDOMList];
    }

    getTitle() {
        return `Inode ${this.inum}: ${this.typeName}`;
    }
}
