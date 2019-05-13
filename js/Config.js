let Config = {};

Config.entrySize = 16;
Config.inodeSize = 64;
Config.blockSize = 512;
Config.numberOfDirectAddress = 12;

Config.numberOfInodesPerBlock = Config.blockSize / Config.inodeSize;
