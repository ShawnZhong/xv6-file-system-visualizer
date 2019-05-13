class Config {
    static entrySize = 16;
    static inodeSize = 64;
    static blockSize = 512;
    static numberOfDirectAddress = 12;

    static numberOfInodesPerBlock = Config.blockSize / Config.inodeSize;
}