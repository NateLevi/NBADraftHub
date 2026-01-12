type BasketballStats = {
    player_name: string;
    team: string;
    conf: string;
    GP: number;
    Min_per: number;
    ORtg: number;
    usg: number;
    eFG: number;
    TS_per: number;
    ORB_per: number;
    DRB_per: number;
    AST_per: number;
    TO_per: number;
    FTM: number;
    FTA: number;
    FT_per: number;
    twoPM: number;
    twoPA: number;
    twoP_per: number;
    TPM: number;
    TPA: number;
    TP_per: number;
    blk_per: number;
    stl_per: number;
    ftr: number;
    yr: string;
    ht: string;
    num: number;
    porpag: number;
    adjoe: number;
    pfr: number;
    year: number;
    pid: number;
    type: string;
    recRank: string;
    astTov: number;
    rimmade: number;
    rimmadeRimmiss: number;
    midmade: number;
    midmadeMidmiss: number;
    rimmadeRatio: number;
    midmadeRatio: number;
    dunksmade: number;
    dunksTotal: number;
    dunksRatio: number;
    pick: number;
    drtg: number;
    adrtg: number;
    dporpag: number;
    stops: number;
    bpm: number;
    obpm: number;
    dbpm: number;
    gbpm: number;
    mp: number;
    ogbpm: number;
    dgbpm: number;
    oreb: number;
    dreb: number;
    treb: number;
    ast: number;
    stl: number;
    blk: number;
    pts: number;
    role: string;
    threePPer100: number;
}

// Function to convert the array of arrays to an array of objects
const convertArrayToBasketballStats = (rawData: any[][]): BasketballStats[] => {
    return rawData.map((playerArray) => {
        return {
            player_name: playerArray[0],
            team: playerArray[1],
            conf: playerArray[2],
            GP: playerArray[3],
            Min_per: playerArray[4],
            ORtg: playerArray[5],
            usg: playerArray[6],
            eFG: playerArray[7],
            TS_per: playerArray[8],
            ORB_per: playerArray[9],
            DRB_per: playerArray[10],
            AST_per: playerArray[11],
            TO_per: playerArray[12],
            FTM: playerArray[13],
            FTA: playerArray[14],
            FT_per: playerArray[15],
            twoPM: playerArray[16],
            twoPA: playerArray[17],
            twoP_per: playerArray[18],
            TPM: playerArray[19],
            TPA: playerArray[20],
            TP_per: playerArray[21],
            blk_per: playerArray[22],
            stl_per: playerArray[23],
            ftr: playerArray[24],
            yr: playerArray[25],
            ht: playerArray[26],
            num: playerArray[27],
            porpag: playerArray[28],
            adjoe: playerArray[29],
            pfr: playerArray[30],
            year: playerArray[31],
            pid: playerArray[32],
            type: playerArray[33],
            recRank: playerArray[34],
            astTov: playerArray[35],
            rimmade: playerArray[36],
            rimmadeRimmiss: playerArray[37],
            midmade: playerArray[38],
            midmadeMidmiss: playerArray[39],
            rimmadeRatio: playerArray[40],
            midmadeRatio: playerArray[41],
            dunksmade: playerArray[42],
            dunksTotal: playerArray[43],
            dunksRatio: playerArray[44],
            pick: playerArray[45],
            drtg: playerArray[46],
            adrtg: playerArray[47],
            dporpag: playerArray[48],
            stops: playerArray[49],
            bpm: playerArray[50],
            obpm: playerArray[51],
            dbpm: playerArray[52],
            gbpm: playerArray[53],
            mp: playerArray[54],
            ogbpm: playerArray[55],
            dgbpm: playerArray[56],
            oreb: playerArray[57],
            dreb: playerArray[58],
            treb: playerArray[59],
            ast: playerArray[60],
            stl: playerArray[61],
            blk: playerArray[62],
            pts: playerArray[63],
            role: playerArray[64],
            threePPer100: playerArray[65],
        };
    });
};

// Fetch player data from barttorvik API for 2025
export const getPlayerData = async (): Promise<BasketballStats[]> => {
    const year = 2026;
    const response = await fetch(`/api/getadvstats.php?year=${year}&json=1`);
    const rawData = await response.json() as any[][];
    
    // Convert the array of arrays to array of objects
    const convertedData = convertArrayToBasketballStats(rawData);
    
    return convertedData;
};
