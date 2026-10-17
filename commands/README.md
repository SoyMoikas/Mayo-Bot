# Mayo-Bot 🤖

A Spanish-language Discord bot I built in 2021 for my community server. It was one of my first full projects: a Node.js app with a modular command system, a database, and several external APIs.

> **Status:** archived. Built on discord.js v12 and `ytdl-core`, both since deprecated, so it no longer runs as-is.

## Features
- **News (`noticias`)**: searches and posts headlines from NewsAPI, with per-server country settings (`confpais`), language filters, and a cache so repeat headlines aren't posted twice
- **Music (`play`, `skip`, `stop`)**: searched YouTube and streamed audio into voice channels (retired after the YouTube library broke)
- **Economy (`balance`, `beg`)**: per-user coin balances stored in MongoDB, with new members auto-registered on join
- **Moderation**: bulk message delete (`clear`), custom prefix per server (`prefix`), reaction roles (work in progress)
- **Fun**: random memes, a greeting command, and Discord Together invites (watch YouTube or play games together in voice)
- **`help`**: auto-generated command list

## How it's built
- **Node.js + discord.js** with a **command handler** and **event handler** that load each command and event from its own file, so new features drop in without touching the core
- **MongoDB (Mongoose)** for user profiles
- **Express** keep-alive endpoint so it could run 24/7 on Replit
- Config and secrets loaded from environment variables (`dotenv`)

## What I learned
- Structuring a project into handlers, commands, and models
- Working with REST APIs, async/await, and rate limits
- **Secrets management:** an early commit exposed credentials. I rotated them and moved everything to environment variables. Never commit `.env` files.
- Depending on unofficial APIs is fragile: the music feature died when the YouTube library broke

## Run it (historical)
```bash
npm install
# create a .env with DISCORD_TOKEN, MONGODB_SRV, NEWS_API_KEY
npm start
```
