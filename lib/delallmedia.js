const {chalk, inquirer, _, fs, instagram, print, delay} = require('./index.js');

(async() => {
  print(chalk`{bgRed {bold.white [>] Delete All Media}}\n`);
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
    const {username, password, target, perExec, delayTime} = await inquirer.prompt(questions);
    const ig = new instagram(username, password);
    print('Logging in..', 'wait', true);
    const login = await ig.login();
    print(`Logged in as @${login.username} (User ID: ${login.pk})`, 'ok');
    const info = await ig.userInfo(login.pk);
    if(info.media_count !=0) {
      print(`Found ${info.media_count} media`, 'ok');
      print('Collecting user feeds..', 'wait');
      const feed = await ig.userFeed(login.pk);
      print(`Doing task..\n`, 'wait');
      do{
        let items = await feed.items();
        items = _.chunk(items, perExec);
        for(let i=0; i<items.length; i++) {
          await Promise.all(items[i].map(async media => {
            const type = media.media_type == 1 ? 'photo' : media.media_type == 2 ? 'video' : 'carousel';
            const del = await ig.deleteMedia(media.pk, type);
            print(`[-] /p/${media.code}/ (${media.pk}) => ${del ? chalk.bold.green('Deleted!') : chalk.bold.red('Failed to delete!')}`)
          }))
          if(i<items.length-1) print(`Wait for ${delayTime}ms..\n` ,'wait', true); await delay(delayTime)
        }
      }while(feed.moreAvailable);
      print(`Task done!`, 'ok', true)
    }else print(`Nothing to delete!`, 'err')
  }catch(err){
    print(err, 'err')
  }
})()