const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

const queue = new Map();





module.exports = {
    name: 'play',
    aliases: ['skip', 'stop'], //We are using aliases to run the skip and stop command follow this tutorial if lost: https://www.youtube.com/watch?v=QBUJ3cdofqc
    cooldown: 0,
    description: 'busca musica de youtube',
    async execute(message,args, cmd, client, Discord){


        //Checking for the voicechannel and permissions (you can add more permissions if you like).
        const voice_channel = message.member.voice.channel;
        if (!voice_channel) return message.channel.send('metete a un canal de voz mamon');
        const permissions = voice_channel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT')) return message.channel.send('Tas bien puñetas, no tienes permisos pa hacer eso');
        if (!permissions.has('SPEAK')) return message.channel.send('Tas bien puñetas, no tienes permisos pa hacer eso');

        //This is our server queue. We are getting this server queue from the global queue.
        const server_queue = queue.get(message.guild.id);

        //If the user has used the play command
        if (cmd === 'play'){
            if (!args.length) return message.channel.send('faltan argumentos');
            let song = {};

            //If the first argument is a link. Set the song object to have two keys. Title and URl.
            if (ytdl.validateURL(args[0])) {
                const song_info = await ytdl.getInfo(args[0]);
                song = { title: song_info.videoDetails.title, url: song_info.videoDetails.video_url }
            } else {
                //If there was no link, we use keywords to search for a video. Set the song object to have two keys. Title and URl.
                const video_finder = async (query) =>{
                    const video_result = await ytSearch(query);
                    return (video_result.videos.length > 1) ? video_result.videos[0] : null;
                }

                const video = await video_finder(args.join(' '));
                if (video){
                    song = { title: video.title, url: video.url }
                } else {
                     message.channel.send('No se encontro el video');
                }
            }

            //If the server queue does not exist (which doesn't for the first video queued) then create a constructor to be added to our global queue.
            if (!server_queue){

                const queue_constructor = {
                    voice_channel: voice_channel,
                    text_channel: message.channel,
                    connection: null,
                    songs: []
                }
                
                //Add our key and value pair into the global queue. We then use this to get our server queue.
                queue.set(message.guild.id, queue_constructor);
                queue_constructor.songs.push(song);
    
                //Establish a connection and play the song with the vide_player function.
                try {
                    const connection = await voice_channel.join();
                    queue_constructor.connection = connection;
                    video_player(message.guild, queue_constructor.songs[0]);
                } catch (err) {
                    queue.delete(message.guild.id);
                    message.channel.send('valio verga la connexion');
                    throw err;
                }
            } else{
                server_queue.songs.push(song);
                return message.channel.send(`**${song.title}** se añadio a la cola!`);
            }
        }

        else if(cmd === 'skip') skip_song(message, server_queue);
        else if(cmd === 'stop') stop_song(message, server_queue);
    }
    
}


/*
module.exports ={
    name: 'play',
    aliases: ['skip', 'stop'],
    cooldown: 0,
    description: 'busca musica de youtube',
    async execute(message,args,cmd,client,Discord){
        const voice_channel = message.member.voice.channel;
        if(!voice_channel) return message.channel.send('metete a un canal de vos mamon');
        const permissions = voice_channel.permissionsFor(message.client.user);
        if(!permissions.has('CONNECT')) return message.channel.send('Tas bien puñetas, no tienes permisos pa hacer eso');
        if(!permissions.has('SPEAK')) return message.channel.send('Tas bien puñetas, no tienes permisos pa hacer eso');

        const server_queue = queue.get(message.guild.id);

        if(cmd === 'play'){
            if(!args.length) return message.channel.send('faltan argumentos');
            let song = {};

            if(ytdl.validateURL(args[0])){
                const song_info = await ytdl.getInfo(args[0]);
                song = {title: song_info.videoDetails.title, url: song_info.videoDetails.video_url}
            }else{
                const video_finder = async (query) =>{
                    const videoResult = await ytSearch(query);
                    return (videoResult.videos.length > 1) ? videoResult.videos[0]: null;
                }

                const video = await video_finder(args.join(' '));
                if(video){
                    song = {title: video.title, url: video.url }
                }else{
                    message.channel.send('No encontro el video');
                }
            }
            
            if(!server_queue){
                const queue_constructor = {
                    voice_channel: voice_channel,
                    text_channel: message.channel,
                    connection: null,
                    songs: []
                }

                queue.set(message.guild.id, queue_constructor);
                queue_constructor.songs.push(song);

                try{
                    const connection = await voice_channel.join;
                    queue_constructor.connection = connection;
                    video_player(message.guild, queue_constructor.songs[0]);
                }catch(err){
                    queue.delete(message.guild.id);
                    message.channel.send('valio verga la conneccion');
                    throw err;
                }
            }else{
                server_queue.songs.push(song);
                return message.channel.send(`se añadio **${song.title}** a la espera \n pura rola vergas`);
            }
        }


    }


}
*/
const video_player = async(guild, song) =>{
    const song_queue = queue.get(guild.id);

    if(!song){
        song_queue.voice_channel.leave();
        queue.delete(guild.id);
        return;
    }
    const stream = ytdl(song.url, { filter: 'audioonly'});
    song_queue.connection.play(stream, { seek: 0, volume: 0.5})
    .on('finish', () =>{
        song_queue.song.shift();
        video_player(guild, song_queue.songs[0]);

    });
    await song_queue.text_channel.send(`Escuchando  **${song.title}**`);
}

const skip_song =(message, server_queue) => {
    if(!message.member.voice.channel)return message.channel.send('necesitas estar en un canal de voz');
    if(!server_queue){
        return message.channel.send(`no hay rolas en la cola`);
    }
    server_queue.connection.dispatcher.end();
}
const stop_song = (message, server_queue) =>{
    if(!message.member.voice.channel) return message.channel.send('necesitas estar en un canal de voz');
    server_queue.songs = [];
    server_queue.connection.dispatcher.end();
}