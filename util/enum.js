function Enum(variantArray) {
    let enumObj = variantArray.reduce((obj, variant) => {
        obj[variant] = variant;
        return obj;
    }, {});
    return Object.freeze(enumObj);
};

export default Enum;