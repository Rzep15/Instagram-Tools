const {chalk, inquirer, _, fs, instagram, print, delay} = require('./index.js');

(async () => {
  print(chalk`{bgRed {bold.white [>] Unfollow All Followed Users}}\n`);
  const questions = [{
      type: 'input',
      name: 'username',
      message: '[>] Input username:',
      validate: (val) => val.length != 0 || 'Please input username!',
  },
    {
      type: 'password',
      name: 'password',
      mask: '*',
      message: '[>] Input password:',
      validate: (val) => val.length != 0 || 'Please input password!'
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
  try {
    const {username, password, target, perExec, delayTime} = await inquirer.prompt(questions);
    const ig = new instagram(username, password);
    print('Logging in..', 'wait', true);
    const login = await ig.login(), info = await ig.userInfo(login.pk);
    print(`Logged in as @${login.username} (ID: ${login.pk})`, 'ok');
    print(`Collecting followed users..`, 'wait');
    print(`You're following ${info.following_count} users!`, 'ok');
    const following = await ig.followingFeed();
    print(`Doing task..\n`, 'wait');
    do{
      let items = await following.items();
      items = _.chunk(items, perExec);
      for(let i=0; i<items.length; i++) {
        await Promise.all(items[i].map(async user => {
          const unfollow = await ig.unfollow(user.pk);
          print(`[-] @${user.username} => ${unfollow ? chalk.bold.green('Unfollowed!') : chalk.bold.red('Failed to Unfollow!')}`)
        }))
        if(i<items.length-1) print(`Wait for ${delayTime}ms..\n` ,'wait', true); await delay(delayTime)
      }
    }while(following.moreAvailable);
    print(`Task done!`, 'ok', true)
  }catch(err) {
    print(err, 'err')
  }
})()