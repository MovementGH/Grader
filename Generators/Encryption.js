var word=0;
function nextWord() {
    word++;
    var chars=[],lword=word;
    while(lword) {
        chars.push(lword%26);
        lword=(lword-(lword%26))/26;
    }
    return chars.map(c=>String.fromCharCode(c+97)).join('');
}

function genKeys(Num) {
    return Array(Num).fill(0).map(a=>String.fromCharCode(Math.floor(Math.random()*26)+65));
}

function checkKeys(Keys) {
    var Sequences=[...new Set(Keys)];
    var SequenceTest=Sequences.map(Key=>Keys.map((s,i)=>(s==Key)?i+1:undefined).filter(l=>l).map(l=>Keys[l]));
    var SequenceCompress=SequenceTest.map(Followers=>[...new Set(Followers)].length);
    var SequenceResult=SequenceCompress.map(e=>0);
    for(var i=0;i<SequenceCompress.length;i++) {
        if(SequenceCompress[i]>1) {
            SequenceResult[i]=1;
            if(SequenceTest[i].length==1) SequenceResult[i]=1;
        }
    }
    if(SequenceResult.filter(s=>s==0).length) {
        return false;
    }
    return true;
}

Generate=(Num)=>{
    //Reset word
    word=0;

    //Generate Encrypted message
    var Keys=genKeys(Num);
    while(checkKeys(Keys)==false) {
        Keys=genKeys(Num);
    }
    
    //Generate Decrypted message
    var Sequences=[...new Set(Keys)]

    var SequenceKey={};
    for(var i=0;i<Sequences.length;i++) {
        var Length=Math.floor(Math.random()*5)+1;
        SequenceKey[Sequences[i]]='';
        for(var i2=0;i2<Length;i2++) {
            SequenceKey[Sequences[i]]+=nextWord()+' ';
        }
        SequenceKey[Sequences[i]]=SequenceKey[Sequences[i]].slice(0,-1);
    }
    
    //Format for input

    var Encrypted=Keys.join('');
    var Decrypted=Keys.map(k=>SequenceKey[k]).join(' ');
    
    var OutputKey=[];
    for(var Key of Sequences) {
        OutputKey.push(Key+' = '+SequenceKey[Key]);
    }
    var Output=OutputKey.join('\n');

    return {input:Encrypted+'\n'+Decrypted,output:Output};
}

module.exports=Generate;
