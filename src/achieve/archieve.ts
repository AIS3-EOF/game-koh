export enum ArchieveType {
    '散財童子' = '散財童子',
    '敗家子' = '敗家子',
    '兩萬五千里長征' = '兩萬五千里長征',
    '槍王之王' = '槍王之王',
    'How_did_we_get_there' = 'How did we get here?',
    '經驗值' = '經驗值',
    'LFI' = 'LFI',
    'konami code' = 'konami code',
    'Front-End hardcoded' = 'Front-End hardcoded',
    '佐藤和真' = '佐藤和真',
    '360_no_scope' = '360 no scope',
    'Game_Controller' = 'Game Controller',
    '走路不看路' = '走路不看路',
}

export class Archievement {
    constructor(
        public type: ArchieveType,
    ) {}
}