let a={'M':1000,'CM':900,'D':500,'CD':400,'C':100,'XC':90,'L':50,'XL':40,'X':10,'IX':9,'V':5,'IV':4,'I':1}
Solve=z=>{y='';for(x in a)while(z>=a[x])y+=x,z-=a[x];return y;}


function Generate(Number) {
    return {input:""+Number,output:Solve(Number)};
}

module.exports=Generate;