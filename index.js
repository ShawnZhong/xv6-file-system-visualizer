const BLOCK_SIZE = 512;
const INODE_SIZE = 64;
const ENTRY_SIZE = 16;
const NDIRECT = 12;

let image;
let superBlock;
let bitmapBlock;
let inodes;


async function main(file) {
    image = await readFile(file);
    superBlock = new SuperBlock();
    bitmapBlock = new BitmapBlock();

    inodes = Array.from(new Array(superBlock.ninodes).keys(), i => new Inode(i));


    console.log(superBlock);
    console.log(bitmapBlock.getData());
    inodes.filter(e => e.type === 1).forEach(e => console.log(e.getData()));
    inodes.filter(e => e.type === 2).forEach(e => console.log(e.getData()));
}

function readFile(file) {
    const fr = new FileReader();
    return new Promise((resolve) => {
        fr.onload = () => resolve(fr.result);
        fr.readAsArrayBuffer(file);
    });
}

class Block {
    constructor(blockNumber) {
        this.block = new DataView(image, BLOCK_SIZE * blockNumber, BLOCK_SIZE);
        this.uint8Array = new Uint8Array(this.block.buffer, this.block.byteOffset, this.block.byteLength);
    }

    isAscii() {
        return this.uint8Array.every(e => e < 128);
    }

    getData(radix = 0) {
        switch (radix) {
            case 0:
                return new TextDecoder("utf-8").decode(this.block);
            case 2:
                return Array.from(this.uint8Array).map(e => e.toString(2).padStart(8, '0'));
            case 16:
                const uint32Array = new Uint32Array(this.block.buffer, this.block.byteOffset, this.block.byteLength);
                return Array.from(uint32Array).map(e => e.toString(16).padStart(8, '0'));
        }
    }
}

class BitmapBlock extends Block {
    constructor() {
        super(superBlock.ninodes * INODE_SIZE / BLOCK_SIZE + 3);
    }

    getData() {
        return super.getData(2);
    }
}

class DirectoryBlock extends Block {
    constructor(blockNumber) {
        super(blockNumber);
    }

    getEntries() {
        let entries = {};
        for (let i = 0; i < BLOCK_SIZE / ENTRY_SIZE; i++) {
            const inum = this.block.getUint16(ENTRY_SIZE * i, true);
            if (inum === 0) continue;

            const nameOffset = this.block.byteOffset + ENTRY_SIZE * i + 2;
            const nameArray = new Uint8Array(this.block.buffer, nameOffset, ENTRY_SIZE - 2);
            const name = new TextDecoder("utf-8").decode(nameArray);

            entries[name] = inum;
        }

        return entries;
    }
}

class SuperBlock extends Block {
    constructor() {
        super(1);

        this.size = this.block.getUint32(0, true);
        this.nblocks = this.block.getUint32(4, true);
        this.ninodes = this.block.getUint32(8, true);
    }
}

class Inode {
    constructor(inum) {
        this.inode = new DataView(image, BLOCK_SIZE * 2 + inum * INODE_SIZE);

        this.type = this.inode.getUint16(0, true);
        this.major = this.inode.getUint16(2, true);
        this.minor = this.inode.getUint16(4, true);
        this.nlink = this.inode.getUint16(6, true);
        this.size = this.inode.getUint32(8, true);

        this.indirectAddress = this.inode.getUint32(12 + NDIRECT * 4, true);
        this.dataAddresses = this.getAddresses();
    }

    getAddresses() {
        const numberOfAddresses = (this.size + BLOCK_SIZE - 1) / BLOCK_SIZE;
        let addresses = new Uint32Array(numberOfAddresses);

        // direct address
        for (let i = 0; i < NDIRECT; i++)
            addresses[i] = this.inode.getUint32(12 + i * 4, true);

        // indirect address
        if (numberOfAddresses > NDIRECT) {
            const indirectBlock = new Block(this.indirectAddress).block;
            for (let i = 0; i < numberOfAddresses - NDIRECT - 1; i++)
                addresses[NDIRECT + i] = indirectBlock.getUint32(i * 4, true);
        }

        return addresses;
    }

    getData() {
        if (this.type === 1) { // is directory
            return Array.from(this.dataAddresses).map(e => new DirectoryBlock(e).getEntries());
        } else if (this.type === 2) { // is file
            const blocks = Array.from(this.dataAddresses).map(e => new Block(e));
            if (blocks.every(e => e.isAscii()))
                return blocks.map(e => e.getData());
            else
                return blocks.map(e => e.getData(16));

        }
    }
}
