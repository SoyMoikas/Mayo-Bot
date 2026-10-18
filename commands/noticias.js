const translate = require("translate") ;
const fs = require("fs")
const fetch = require("node-fetch");
module.exports = {
    tag:"info",
    name: 'noticias',
    aliases:[],
    otherCommands:["confpais"],
    description: "busca noticias en internet",
    parameters:[" |[busqueda] | [idioma]"],
    async execute(message,args,cmd,client,Discord,prefix,profileData){
      /*
      translate(args[0], { from: "es", to: "en" }).then(text => {
        console.log(text); 
        
      });
      */
      let newsarg = message.content.split("|")
      let config = JSON.parse(fs.readFileSync("./config.json","utf8"));
      let pais = "mx";
      if(cmd ==="confpais"){
        if(!args.length) return message.reply("debes elegir un pais \n ejemplo: [us],[mx],[vu],[ru]")
        if(args[0].length !=2)return message.reply("debe ser formato 2-letter ISO 3166-1")
        
        
        config[message.guild.id].pais = args[0]
        fs.writeFile("./config.json",JSON.stringify(config), (err) =>{
          console.log(err);
        } );
        return message.channel.send("pais actualizado "+config[message.guild.id].pais)
      }
      let newsCache =[]
      newsCache = JSON.parse(fs.readFileSync("./newsCache.json","utf8"));
      if(config[message.guild.id].pais){
        pais = config[message.guild.id].pais
      }
      let param1="&language=";
      let param2;
      let param3;
      let param4;
      if(newsarg.length>2){
       param1 += newsarg[2] 
      }
        let fnews;
        const larrow = '⬅';
        const rarrow = '➡';
        let index=0;
         let newsEmbed = new Discord.MessageEmbed()
      if(newsarg.length>1){
        search = newsarg[1];
        await fetch(`https://newsapi.org/v2/everything?q=${search}${param1}&apiKey=${process.env.NEWS_API_KEY}`)
        .then(response => response.json())
        .then(news =>{
          fnews = news.articles
          

        }).catch(err => console.log("error: "+err))
      }
      if(!args.length){
        await fetch(`https://newsapi.org/v2/top-headlines?country=${pais}&apiKey=${process.env.NEWS_API_KEY}`)
        .then(response => response.json())
        .then(news =>{
          fnews = news.articles

        }).catch(err => console.log("error: "+err))
      }
      if(fnews == null) return message.reply("No se encontraron noticias")
          newsEmbed.setTitle(fnews[index].title)
          if(fnews[index].author!=null){
          newsEmbed.setAuthor(fnews[index].author)
          }else{
            newsEmbed.setAuthor('Anonimo')
          }
          newsEmbed.setDescription(fnews[index].description)
          newsEmbed.setURL(fnews[index].url)
          newsEmbed.setImage(fnews[index].urlToImage)
          newsEmbed.setFooter('1 '+' de '+fnews.length)
        
        let membed = await message.channel.send(newsEmbed);
        let mid = membed.id
        let nObj={}
        
        //console.log(fnews)
        nObj={
          nholder:{
            msgID:mid,
            indx:0,
            thenews:fnews
          }
        }
          //console.log(nObj)
          newsCache.push(nObj)
          
          fs.writeFile("./newsCache.json",JSON.stringify(newsCache), (err) =>{
          console.log(err);
          } );
        membed.react(larrow);
        membed.react(rarrow)
        client.on('messageReactionAdd', async (reaction,user)=>{
          let count =0;
          if(reaction.message.partial) await reaction.message.fetch();
          if(reaction.partial) await reaction.message.fetch();
          if(user.bot) return;
          if(!reaction.message.guild) return;
          //check for the right message
          for(let i =0;i<newsCache.length;i++){
            
            if(newsCache[i].nholder.msgID == reaction.message.id){
              fnews = await newsCache[i].nholder.thenews
              index = await newsCache[i].nholder.indx
              count = i;
            }
          }

            //previous article
            if(reaction.emoji.name === larrow){
              
              reaction.users.remove(user.id)
              if(index > 0){
                index--;
                pagenumber=index+1
                newsEmbed.setTitle(fnews[index].title)
                if(fnews[index].author!=null){
                  newsEmbed.setAuthor(fnews[index].author)
                }else{
                  newsEmbed.setAuthor('Anonimo')
                }
                newsEmbed.setDescription(fnews[index].description)
                newsEmbed.setURL(fnews[index].url)
                newsEmbed.setImage(fnews[index].urlToImage)
                newsEmbed.setFooter(pagenumber+' de '+fnews.length)
                reaction.message.edit(newsEmbed)
                newsCache[count].nholder.indx = index;
                

                fs.writeFile("./newsCache.json",JSON.stringify(newsCache), (err) =>{
                console.log(err);
                 } );
              }
            }
            //next asrticle
            if(reaction.emoji.name === rarrow){
              
              reaction.users.remove(user.id)
                
                if(fnews[index+1]!=null){
                  index++;
                  pagenumber=index+1
                  newsEmbed.setTitle(fnews[index].title)
                  if(fnews[index].author!=null){
                    newsEmbed.setAuthor(fnews[index].author)
                  }else{
                    newsEmbed.setAuthor('Anonimo')
                  }
                  newsEmbed.setDescription(fnews[index].description)
                  newsEmbed.setURL(fnews[index].url)
                  newsEmbed.setImage(fnews[index].urlToImage)
                  if(fnews[index+1]==null){
                    newsEmbed.setFooter(pagenumber+' de '+fnews.length)
                  }else{
                    newsEmbed.setFooter(pagenumber+' de '+fnews.length)
                  }
                  reaction.message.edit(newsEmbed)
                  newsCache[count].nholder.indx = index;
                }else{
                  
                }
                

                fs.writeFile("./newsCache.json",JSON.stringify(newsCache), (err) =>{
                console.log(err);
                 } );
            }

        });
    }
}
