const TelegramApi = require('node-telegram-bot-api');
const token = '6744570116:AAGr2mTNz9hXxuNAUf6KQvK0aij_NB4wods';
const {gameOptions, againOptions} = require('./options/options');
const sequelize = require('./db');
const UserModel = require('./models');
const bot = new TelegramApi(token, {polling: true});
// telegabot
const chats = {};

const startGame = async (chatid) => {
    await bot.sendMessage(chatid, 'Я загадаю число от 0 до 10, а ты огадывай');
    const randomNum = Math.floor(Math.random() * 10);
    chats[chatid] = randomNum;
    await bot.sendMessage(chatid, 'Отгадывай)', gameOptions);    
}

const start = async () => {

    try {
        await sequelize.authenticate();
        await sequelize.sync();
    } catch (err) {
        console.log('Подключение к БД рухнуло(', err)
    }

    bot.setMyCommands([
        {command: '/start', description: 'Начать работу бота'},
        {command: '/info', description: 'Узнать свое имя'},
        {command: '/game', description: 'Сыграть в игру?'},
    ])
    
    bot.on('message', async msg => {
        const text = msg.text; 
        const chatID = msg.chat.id;
    
        try {
            if (text === '/start') {
                await UserModel.create(chatID);
                await bot.sendSticker(chatID, 'https://tlgrm.ru/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/11.webp');
                return bot.sendMessage(chatID, 'Добро пожаловать в тестовый бот');
            }
            if (text === '/info') {
                const user = await UserModel.findOne({chatID});
                return bot.sendMessage(chatID, `У игрока: ${msg.from.first_name} правильных ответов: ${user.right}, неправильных: ${user.wrong}`);
            }
            if (text === '/game') {
                return startGame(chatID);
            }
            return bot.sendMessage(chatID, 'Используйте команды, я вас не понимаю');
        } catch (e) {
            return bot.sendMessage(chatID, 'Произошла ошибка с кодом...')
        }

    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatID = msg.message.chat.id;
        if (data === 'againCommand') {
            return startGame(chatID);
        }

        const user = await UserModel.findOne({chatID})

        if (data == chats[chatID]) {
            user.right += 1;
            await bot.sendMessage(chatID, `Поздравляем, ты отгадал загаданное число ${chats[chatID]}`, againOptions);
        } else {
            user.wrong += 1;
            await bot.sendMessage(chatID, `К сожалению, загаданное число не совпадает с твоим ${data}\nБот загадал ${chats[chatID]}`, againOptions);
        }
        await user.save();
    })
}
start()