const TelegramApi = require('node-telegram-bot-api');
const token = '6744570116:AAGr2mTNz9hXxuNAUf6KQvK0aij_NB4wods';
const {gameOptions, againOptions} = require('./options/options');
const bot = new TelegramApi(token, {polling: true});

const chats = {};

const startGame = async (chatid) => {
    await bot.sendMessage(chatid, 'Я загадаю число от 0 до 10, а ты огадывай');
    const randomNum = Math.floor(Math.random() * 10);
    chats[chatid] = randomNum;
    await bot.sendMessage(chatid, 'Отгадывай)', gameOptions);    
}

const start = () => {
    bot.setMyCommands([
        {command: '/start', description: 'Начать работу бота'},
        {command: '/info', description: 'Узнать свое имя'},
        {command: '/game', description: 'Сыграть в игру?'},
    ])
    
    bot.on('message', async msg => {
        const text = msg.text; 
        const chatID = msg.chat.id;
    
        if (text === '/start') {
            await bot.sendSticker(chatID, 'https://tlgrm.ru/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/11.webp');
            return bot.sendMessage(chatID, 'Добро пожаловать в тестовый бот');
        }
        if (text === '/info') {
            return bot.sendMessage(chatID, `Тебя зовут ${msg.from.first_name}`);
        }
        if (text === '/game') {
            return startGame(chatID);
        }
        return bot.sendMessage(chatID, 'Используйте команды, я вас не понимаю');
    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatID = msg.message.chat.id;
        if (data === 'againCommand') {
            return startGame(chatID);
        }
        if (data === chats[chatID]) {
            return bot.sendMessage(chatID, `Поздравляем, ты отгадал загаданное число ${chats[chatID]}`, againOptions);
        } else {
            return bot.sendMessage(chatID, `К сожалению, загаданное число не совпадает с твоим ${data}\nБот загадал ${chats[chatID]}`, againOptions);
        }
    })
}
start()