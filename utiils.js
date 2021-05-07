
function Hex2Bin(str){
    const num = parseInt("0x"+str);
    const sign = (num >> 31) ? -1 : 1;
    const exponent = (num >> 23) - 127;
    const mantissa = (num & 0x7fffff);
    let res = 1;
    for(let i=0;i<23;++i){
        res += ((Math.pow(2,i) & mantissa) === 0) ? 0 : Math.pow(2,i-23);
    }
    console.log(sign * Math.pow(2,exponent) * res);
    return sign * Math.pow(2,exponent) * res;
}