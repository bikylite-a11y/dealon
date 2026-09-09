/**
 * Helper to discover your personal Chat ID or Channel ID
 * Run this after clicking /start on @Deal_On_Bot or adding it to a channel.
 */
const https = require('https');

const token = process.argv[2] || process.env.TELEGRAM_BOT_TOKEN || '8797269648:AAHfhVJf0YmljEAJgf89Gp3Nv6VB01_gFlg';

console.log('🔍 Checking latest updates for @Deal_On_Bot...\n');

https.get(`https://api.telegram.org/bot${token}/getUpdates`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (!json.ok) {
        console.error('Error from Telegram:', json.description);
        return;
      }

      if (json.result.length === 0) {
        console.log('ℹ️ No messages or channel events detected yet.');
        console.log('\n👉 TO TEST IN DIRECT MESSAGE:');
        console.log('   1. Open Telegram and search for: @Deal_On_Bot');
        console.log('   2. Click "START" or send "Hello"');
        console.log('   3. Run this script again: node check_chat_id.js');
        console.log('\n👉 TO BROADCAST TO A CHANNEL:');
        console.log('   1. Create a Channel in Telegram (e.g., @DealOnDeals)');
        console.log('   2. Go to Channel Settings > Administrators > Add Administrator');
        console.log('   3. Add @Deal_On_Bot as Admin with "Post Messages" enabled');
        console.log('   4. Run: node tracker.js --token="8797269648:..." --chat="@YourChannelHandle"');
        return;
      }

      console.log('🎉 Detected Chat IDs you can use with tracker.js:\n');
      json.result.forEach(update => {
        if (update.message) {
          const from = update.message.from;
          const chat = update.message.chat;
          console.log(`👤 User / Direct Message:`);
          console.log(`   Name: ${from.first_name} ${from.last_name || ''} (@${from.username || 'no_username'})`);
          console.log(`   Chat ID: ${chat.id}`);
          console.log(`   Command to run:`);
          console.log(`   node tracker.js --token="${token}" --chat="${chat.id}" --test\n`);
        }
        if (update.channel_post) {
          const chat = update.channel_post.chat;
          console.log(`📢 Channel Broadcast:`);
          console.log(`   Title: ${chat.title} (@${chat.username || chat.id})`);
          console.log(`   Chat ID: ${chat.username ? '@' + chat.username : chat.id}`);
          console.log(`   Command to run:`);
          console.log(`   node tracker.js --token="${token}" --chat="${chat.username ? '@' + chat.username : chat.id}" --test\n`);
        }
      });
    } catch (e) {
      console.error('Failed to parse Telegram response:', e);
    }
  });
}).on('error', err => {
  console.error('Request failed:', err.message);
});
