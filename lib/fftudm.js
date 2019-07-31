const {chalk, inquirer, _, fs, instagram, print, delay} = require('./index.js');

(async() => {
  print(chalk`{bgRed {bold.white [>] Follow Followers of Targeted User (+Like and DM)}}\n`);
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
    name: 'target',
    message: '[>] Input target\'s username (without \'@\'):',
    validate: (val) => val.length !=0 || 'Please input target\'s username!'
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
    print(`Collecting information of @${target}..`, 'wait');
    const id = await ig.getIdByUsername(target), info = await ig.userInfo(id);
    if(!info.is_private) {
      print(`@${target} (User ID: ${id}) => Followers: ${info.follower_count}, Following: ${info.following_count}`, 'ok');
      print('Collecting followers..', 'wait');
      const targetFollowers = await ig.followersFeed(id);
      print('Doing task..\n', 'wait')
      do{
        let items = await targetFollowers.items();
        items = _.chunk(items, perExec);
        for(let i=0; i<items.length; i++) {
          await Promise.all(items[i].map(async follower => {
            const status = await ig.friendshipStatus(follower.pk);
            if(!follower.is_private && !status.following && !status.followed_by) {
              const media = await ig.userFeed(follower.pk), lastMedia = await media.items();
              const text = fs.readFileSync('./lib/dm-texts.txt', 'utf8').split(/\r\n|\r|\n/);
              const msg = text[Math.floor(Math.random()*text.length)];
              if(lastMedia.length != 0 && lastMedia[0].pk) {
                const task = [ig.follow(follower.pk), ig.like(lastMedia[0].pk), ig.sendDirectMessage(follower.pk, msg)];
                let [follow, like, dm] = await Promise.all(task);
                follow = follow ? chalk.bold.green(`Follow`) : chalk.bold.red('Follow');
                like = like ? chalk.bold.green('Like') : chalk.bold.red('Like');
                dm = dm ? chalk.bold.green('DM') : chalk.bold.red('DM');
                print(`[+] @${follower.username} => [${follow}, ${like}, ${dm}] | ${chalk.cyanBright(msg)}`)
              }else print(chalk`[-] @${follower.username} => {yellow No posts yet, Skip.}`)
            }else print(chalk`[-] @${follower.username} => {yellow Private or already followed/follows you, Skip.}`)
          }))
          if(i<items.length-1) print(`Wait for ${delayTime}ms..\n` ,'wait', true); await delay(delayTime)
        }
      }while(targetFollowers.moreAvailable);
      print(`Task done!`, 'ok', true)
    }else print(`@${target} is private account`, 'err') 
  }catch(err){ 
    print(err, 'err') 
  }
})()