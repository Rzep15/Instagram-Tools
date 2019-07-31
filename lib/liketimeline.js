const {chalk, inquirer, _, fs, instagram, print, delay} = require('./index.js');

(async() => {
  print(chalk`{bgRed {bold.white [>] Like All Media on Timeline}}\n`);
  const questions = [{
    type: 'input',
    name: 'username',
    message: '[>] Input username:',
    validate: (val) => val.length !=0 || 'Please input username!',
  },
  {
    type: 'password',
    name: 'password',
    mask: '*',
    message: '[>] Input password:',
    validate: (val) => val.length !=0 || 'Please input password!'
  },
  {
    type: 'input',
    name: 'perExec',
    message: '[>] Input limit per-execution:',
    validate: (val) => /[0-9]/.test(val) || 'Only input numbers'
  },
  {
    type: 'input',
    name: 'delayTime',
    message: '[>] Input delay time (in milliseconds):',
    validate: (val) => /[0-9]/.test(val) || 'Only input numbers'
  }];

  try{
    const {username, password, perExec, delayTime} = await inquirer.prompt(questions);
    const ig = new instagram(username, password);
    print('Logging in..', 'wait', true);
    const login = await ig.login();
    print(`Logged in as @${login.username} (User ID: ${login.pk})`, 'ok');
    print('Collecting timeline feeds..', 'wait');
    const feed = await ig.timelineFeed();
    print('Doing task..\n', 'wait');
    do{
      let items = await feed.items();
      items = _.chunk(items, perExec);
      for(let i=0; i<items.length; i++) {
        await Promise.all(items[i].map(async media => {
          if(!media.has_liked) {
            const like = await ig.like(media.pk);
            print(`[+] @${media.user.username} [Media ID: ${media.pk}] => ${like ? chalk.bold.green('Liked!') : chalk.bold.red('Failed to Like!')}`)
          }else print(chalk`[-] @${media.user.username} [Media ID: ${media.pk}] => {yellow Already liked!}`)
        }))
        if(i<items.length-1) print(`Wait for ${delayTime}ms..\n` ,'wait', true); await delay(delayTime)
      }
    }while(feed.moreAvailable);
    print(`Task done!`, 'ok', true)
  }catch(err){
    print(err, 'err')
  }
})()