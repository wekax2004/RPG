export var VocationType;
(function (VocationType) {
    VocationType[VocationType["NONE"] = 0] = "NONE";
    VocationType[VocationType["KNIGHT"] = 1] = "KNIGHT";
    VocationType[VocationType["PALADIN"] = 2] = "PALADIN";
    VocationType[VocationType["DRUID"] = 3] = "DRUID";
    VocationType[VocationType["SORCERER"] = 4] = "SORCERER";
})(VocationType || (VocationType = {}));
export const Vocations = {
    [VocationType.NONE]: {
        name: "None", baseHp: 150, baseMana: 0, capacity: 400, hpGain: 5, manaGain: 5
    },
    [VocationType.KNIGHT]: {
        name: "Knight", baseHp: 200, baseMana: 50, capacity: 600, hpGain: 15, manaGain: 5
    },
    [VocationType.PALADIN]: {
        name: "Paladin", baseHp: 175, baseMana: 100, capacity: 500, hpGain: 10, manaGain: 15
    },
    [VocationType.DRUID]: {
        name: "Druid", baseHp: 150, baseMana: 200, capacity: 300, hpGain: 5, manaGain: 30
    },
    [VocationType.SORCERER]: {
        name: "Sorcerer", baseHp: 150, baseMana: 200, capacity: 300, hpGain: 5, manaGain: 30
    }
};
