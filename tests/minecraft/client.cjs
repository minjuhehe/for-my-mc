// Controlled, offline-mode diagnostic client. No actions before stdin commands.
const readline = require('node:readline');
const mineflayer = require(process.env.LOSTSKY_MINEFLAYER_PATH || 'mineflayer');
const [host, portText, username = 'LostSkyTest'] = process.argv.slice(2);
if (!host || !portText || !/^LostSkyTest[A-Z0-9]*$/.test(username)) {
  console.error('Usage: node tests/minecraft/client.cjs HOST PORT [LostSkyTest...]');
  process.exit(2);
}
const emit = (event, data) => console.log(JSON.stringify({ event, data }));
const bot = mineflayer.createBot({ host, port: Number(portText), username,
  auth: 'offline', version: '1.21.11', viewDistance: 'tiny' });
let ready = false;
let pending = Promise.resolve();
const describe = item => item ? {
  slot: item.slot, name: item.name, count: item.count,
  nbt: item.nbt, components: item.components
} : null;
bot.on('resourcePack', () => {
  // Mineflayer acknowledges the protocol; it does not render/apply the pack.
  bot.acceptResourcePack();
  emit('resourcePack', 'Acknowledged by headless client; no visual/font test');
});
bot.once('spawn', () => { ready = true; emit('ready', { username, version: bot.version }); });
bot.on('messagestr', message => emit('chat', message));
bot.on('windowOpen', window => emit('windowOpen', { id: window.id, title: window.title,
  inventoryStart: window.inventoryStart, inventoryEnd: window.inventoryEnd }));
bot.on('windowClose', () => emit('windowClose', true));
bot.on('kicked', reason => emit('kicked', reason));
bot.on('error', error => emit('error', error.message));
bot.on('end', reason => { emit('end', reason); process.exit(0); });

async function action(command) {
  if (!ready && command.action !== 'quit') throw Error('Client not ready');
  switch (command.action) {
    case 'chat':
      if (!String(command.text).startsWith('/')) throw Error('Only explicit game commands accepted');
      bot.chat(command.text); break;
    case 'inventory': emit('inventory', bot.inventory.slots.map(describe)); break;
    case 'window': emit('window', bot.currentWindow ? {
      title: bot.currentWindow.title, inventoryStart: bot.currentWindow.inventoryStart,
      slots: bot.currentWindow.slots.map(describe)
    } : null); break;
    case 'click': await bot.clickWindow(command.slot, command.mouse || 0, command.mode || 0); break;
    case 'close': if (bot.currentWindow) bot.closeWindow(bot.currentWindow); break;
    case 'equip': {
      const item = bot.inventory.items().find(item => item.name === command.item);
      if (!item) throw Error('Item not present');
      await bot.equip(item, 'hand'); break;
    }
    case 'position': emit('position', bot.entity.position); break;
    case 'quit': bot.quit('Diagnostic finished'); break;
    default: throw Error('Unknown action');
  }
  emit('actionComplete', command.action);
}
readline.createInterface({ input: process.stdin }).on('line', line => {
  pending = pending.then(() => action(JSON.parse(line))).catch(error => emit('actionError', error.message));
});
