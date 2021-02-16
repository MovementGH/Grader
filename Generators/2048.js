function Solve(Numbers) {
    Numbers=[...Numbers];
    for(var i=0;i<Numbers.length;i++) {
        if(Numbers[i]==Numbers[i+1]) {
            if(Numbers[i]>=9007199254740992)
                return -1;
            Numbers.splice(i,2,Numbers[i]*2);
            i=-1;
        }
    }
    return Numbers;
}


function Generate(Length) {
    var Numbers=[];
    for(var i=0;i<Length;i++)
        Numbers.push(2<<Math.floor(Math.random()*5));
    return {input:Numbers.join` `,output:Solve(Numbers).join` `+'\n'+Solve(Numbers.reverse()).reverse().join` `};
}

module.exports=Generate;