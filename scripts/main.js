import {getWord} from "./words.js"
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const grey = '#696969'
const yellow = '#ffff00'
const green = '#00ff00'
class WordFinder{
    constructor(){
        this.words = []
        this.copy = []
        this.length = NaN
        this.greenLetters = []
        this.yellowLetters = []
        this.greyLetters = []
        this.puzzleWords = []
        this.color = grey
        this.keyBoard = new KeyBoard()
        this.slider = new Slider(canvas.width/2,150,11,4,5,function(){
            wordFinder.filterLengths(this.num)
            wordFinder.addWord()
        })
        this.filterWords()
    }
    draw(){
        if(isNaN(this.length)){
            ctx.font = '36px Arial'
            ctx.fillStyle = '#000000'
            let txt = 'How long is the word?'
            let width = ctx.measureText(txt).width
            ctx.fillText(txt,canvas.width/2-width/2,75)
            this.slider.draw()
        }
        else{
            this.puzzleWords.forEach(w => w.draw())
            this.keyBoard.draw()
            this.sampleWords.draw()
        }
    }
    filterWords(){
        const words = getWord()
        let startIndex = 0
        let endIndex = 0
        for(let i=0; i<370105; i++){
            endIndex = words.indexOf('\n',startIndex)
            this.words.push(words.slice(startIndex,endIndex))
            startIndex = endIndex+1
        }
    }
    filterLengths(length){
        this.words.forEach(w => {
            if(w.length == length){
                this.copy.push(w)
            }
        })
        this.length = length
    }
    filterLetters(){
        const copy = wordFinder.copy.filter(w => {
            for(let i=0; i<wordFinder.greyLetters.length; i++){
                const index = w.search(wordFinder.greyLetters[i])
                if(index != -1){
                    if(wordFinder.yellowLetters.find(l => l.letter == wordFinder.greyLetters[i])){
                        let num = 0
                        for(let p=0; p<5; p++){
                            if(w.slice(p,p+1) == wordFinder.greyLetters[i]){
                                num += 1
                            }
                        }
                        if(num>1){
                            return false
                        }
                    }
                    else if(!wordFinder.greenLetters.find(l => l.letter == wordFinder.greyLetters[i] && l.pos-1 == index)){
                        return false
                    }
                }
            }
            for(let i=0; i<wordFinder.greenLetters.length; i++){
                if(w.slice(wordFinder.greenLetters[i].pos-1,wordFinder.greenLetters[i].pos) != wordFinder.greenLetters[i].letter){
                    return false
                }
            }
            for(let i=0; i<wordFinder.yellowLetters.length; i++){
                if(w.search(wordFinder.yellowLetters[i].letter) == -1){
                    return false
                }
                else if(wordFinder.yellowLetters[i].nonpos.find(p => {
                    if(w.slice(p-1,p) == wordFinder.yellowLetters[i].letter){
                        return true
                    }
                })){
                    return false
                }
            }
            return true
        })
        wordFinder.copy = copy
        console.log(wordFinder)
    }
    wasClicked(e){
        const obj = {}
        if(e.type == 'touchstart'){
            obj.pageX = e.changedTouches[0].pageX
            obj.pageY = e.changedTouches[0].pageY
        }
        else{
            obj.pageX = e.pageX
            obj.pageY = e.pageY
        }
        if(isNaN(this.length)){
            this.slider.wasClicked(obj)
            this.sampleWords = new SampleWords(this.copy)
        }
        else{
            const char = this.keyBoard.wasClicked(obj)
            if(char == 'delete'){
                const puzzleWord = this.puzzleWords[this.puzzleWords.length-1]
                for(let i=0; i<this.length; i++){
                    if(puzzleWord['char'+i].char == undefined){
                        if(i != 0){
                            const num = i-1
                            puzzleWord['char'+num] = {}
                        }
                        break
                    }
                }
            }
            else if(char != grey && char != green && char != yellow && char != undefined){
                console.log(char,this.color)
                this.puzzleWords[this.puzzleWords.length-1].insertChar(char,this.color)
            }
            else if(char != undefined){
                this.color = char
            }
        }
    }
    addWord(){
        if(wordFinder.puzzleWords.length>0){
            wordFinder.pullInfo(this)
        }
        if(wordFinder.puzzleWords.length<4){
            wordFinder.puzzleWords.push(new Word(canvas.width/2,100+wordFinder.puzzleWords.length*75,wordFinder.length,wordFinder.addWord))
        }
        else if(wordFinder.puzzleWords.length==4){
            wordFinder.puzzleWords.push(new Word(canvas.width/2,100+wordFinder.puzzleWords.length*75,wordFinder.length,wordFinder.pullInfo))
        }
    }
    pullInfo(word){
        for(let i=0; i<word.length; i++){
            if(word['char'+i].color == grey){
                wordFinder.greyLetters.push(word['char'+i].char)
            }
            if(word['char'+i].color == yellow){
                wordFinder.yellowLetters.push({letter:word['char'+i].char,nonpos:[i+1]})
            }
            if(word['char'+i].color == green){
                wordFinder.greenLetters.push({letter:word['char'+i].char,pos:i+1})
            }
        }
        wordFinder.filterLetters()
    }
}
class Slider{
    constructor(x,y,max,min,num,fn){
        this.x = x
        this.y = y
        this.max = max
        this.min = min
        this.num = num
        this.fn = fn
    }
    draw(){
        ctx.font = '36px Arial'
        ctx.fillStyle = '#000000'
        let width = ctx.measureText(this.num).width
        ctx.fillText(this.num,this.x-width/2,this.y)
        let txt = 'Confirm'
        ctx.font = '24px Arial'
        width = ctx.measureText(txt).width
        ctx.fillStyle = '#696969'
        ctx.fillRect(this.x-100,this.y-40,50,50)
        ctx.fillRect(this.x+50,this.y-40,50,50)
        ctx.fillRect(this.x-50,this.y+25,100,33)
        ctx.fillStyle = '#000000'
        ctx.fillRect(this.x-90,this.y-20,30,10)
        ctx.fillRect(this.x+60,this.y-20,30,10)
        ctx.fillRect(this.x+70,this.y-30,10,30)
        ctx.fillText(txt,this.x-width/2,this.y+50)
    }
    wasClicked(e){
        const x = e.pageX-10
        const y = e.pageY-10
        if(x>=this.x-100 && x<=this.x-50 && y>=this.y-40 && y<=this.y+10 && this.num != this.min){
            this.num -= 1
        }
        if(x>=this.x+50 && x<=this.x+100 & y>=this.y-40 && y<=this.y+10 && this.num != this.max){
            this.num += 1
        }
        if(x>=this.x-50 && x<=this.x+50 && y>=this.y+25 && y<=this.y+58){
            this.fn()
        }
    }
}
class Word{
    constructor(x,y,length,fn){
        this.x = x-length*37.5
        this.y = y
        this.length = length
        this.fn = fn
        for(let i=0; i<this.length; i++){
            this['char'+i] = {}
        }
    }
    draw(){
        ctx.lineWidth = 3
        for(let i=0; i<this.length; i++){
            ctx.strokeRect(this.x+75*i,this.y,69,69)
        }
        for(let i=0; i<this.length; i++){
            if(this['char'+i].char != undefined){
                ctx.fillStyle = this['char'+i].color
                ctx.fillRect(this.x+75*i+2,this.y+2,65,65)
                ctx.font = '48px Arial'
                const width = ctx.measureText(this['char'+i].char).width
                ctx.fillStyle = '#000000'
                ctx.fillText(this['char'+i].char,this.x+75*i+25-width/10,this.y+48)
            }
        }
    }
    insertChar(char,color){
        for(let i=0; i<this.length; i++){
            if(this['char'+i].char == undefined){
                this['char'+i] = {char:char,color:color}
                if(i == this.length-1){
                    this.fn()
                    setTimeout(() => {
                        wordFinder.sampleWords.updateWords(wordFinder.copy)
                    },500)
                }
                break
            }
        }
    }
}
class KeyBoard{
    constructor(){
        this.row1 = ['q','w','e','r','t','y','u','i','o','p']
        this.row2 = ['a','s','d','f','g','h','j','k','l']
        this.row3 = ['z','x','c','v','b','n','m']
    }
    draw(){
        ctx.fillStyle = grey
        ctx.fillRect(canvas.width/2-100,canvas.height-300,50,50)
        ctx.fillStyle = yellow
        ctx.fillRect(canvas.width/2-25,canvas.height-300,50,50)
        ctx.fillStyle = green
        ctx.fillRect(canvas.width/2+50,canvas.height-300,50,50)
        let x = canvas.width/2-this.row1.length*30
        ctx.lineWidth = 2
        ctx.fillStyle = '#000000'
        ctx.font = '48px Arial'
        for(let i=0; i<this.row1.length; i++){
            ctx.strokeRect(x+i*60,canvas.height-225,48,48)
            const width = ctx.measureText(this.row1[i]).width
            ctx.fillText(this.row1[i],x+i*60-width/1.5+30,canvas.height-187)
        }
        x = canvas.width/2-this.row2.length*30
        for(let i=0; i<this.row2.length; i++){
            ctx.strokeRect(x+i*60,canvas.height-155,48,48)
            const width = ctx.measureText(this.row2[i]).width
            ctx.fillText(this.row2[i],x+i*60-width/1.5+30,canvas.height-117)
        }
        x = canvas.width/2-this.row3.length*30
        for(let i=0; i<this.row3.length; i++){
            ctx.strokeRect(x+i*60,canvas.height-85,48,48)
            const width = ctx.measureText(this.row3[i]).width
            ctx.fillText(this.row3[i],x+i*60-width/1.5+30,canvas.height-47)
        }
        ctx.strokeRect(x+this.row3.length*60,canvas.height-85,80,50)
        const txt = 'delete'
        ctx.font = '24px Arial'
        const width = ctx.measureText(txt).width
        ctx.fillText(txt,x+this.row3.length*60+40-width/2,canvas.height-55)
    }
    wasClicked(e){
        const x = e.pageX-10
        const y = e.pageY-10
        const x1 = canvas.width/2+this.row3.length*30
        if(y>=canvas.height-225 && y<=canvas.height-177){
            for(let i=0; i<this.row1.length; i++){
                const x1 = canvas.width/2-this.row1.length*30+i*60
                if(x>=x1 && x<=x1+48){
                    return this.row1[i]
                }
            }
        }
        else if(y>=canvas.height-155 && y<=canvas.height-107){
            for(let i=0; i<this.row2.length; i++){
                const x1 = canvas.width/2-this.row2.length*30+i*60
                if(x>=x1 && x<=x1+48){
                    return this.row2[i]
                }
            }
        }
        else if(y>=canvas.height-85 && y<=canvas.height-37){
            for(let i=0; i<this.row3.length; i++){
                const x1 = canvas.width/2-this.row3.length*30+i*60
                if(x>=x1 && x<=x1+48){
                    return this.row3[i]
                }
            }
        }
        else if(y>=canvas.height-300 && y<=canvas.height-50){
            if(x>=canvas.width/2-100 && x<=canvas.width/2-50){
                return grey
            }
            if(x>=canvas.width/2-25 && x<=canvas.width/2+25){
                return yellow
            }
            if(x>=canvas.width/2+50 && x<=canvas.width/2+100){
                return green
            }
        }
        if(y>=canvas.height-85 && y<=canvas.height-35 && x>=x1 && x<=x1+80){
            return 'delete'
        }
    }
}
class SampleWords{
    constructor(words){
        this.x = canvas.width-300
        this.suggestedWords = []
        this.updateWords(words)
    }
    draw(){
        ctx.font = '36px Arial'
        let txt = 'Suggested Words'
        let width = ctx.measureText(txt).width
        ctx.fillText(txt,this.x+150-width/2,50)
        for(let i=0; i<this.suggestedWords.length; i++){
            txt = this.suggestedWords[i]
            width = ctx.measureText(txt).width
            ctx.fillText(txt,this.x+150-width/2,100+i*50)
        }
    }
    updateWords(words){
        this.suggestedWords = []
        if(words.length>10){
            for(let i=0; i<10; i++){
                const word = words[Math.round(Math.random()*(words.length-1))]
                if(this.suggestedWords.find(w => w == word)){
                    this.suggestedWords.push(words.find(w => !this.suggestedWords.find(pw => pw == w)))
                }
                else{
                    this.suggestedWords.push(word)
                }
            }
        }
        else{
            this.suggestedWords = words
        }
    }
}
const wordFinder = new WordFinder()
function mainLoop(){
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0,0,canvas.width,canvas.height)
    wordFinder.draw()
    requestAnimationFrame(mainLoop)
}
mainLoop()
window.addEventListener('mousedown',function(e){wordFinder.wasClicked(e)})
window.addEventListener('touchstart',function(e){wordFinder.wasClicked(e)})