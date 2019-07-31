const {chalk, inquirer, _, fs, instagram, print, delay} = require('./index.js');

(async() => {
  print(chalk`{bgRed {bold.white [>] Follow User from Media Likers (+Like and Comment)}}\n`);
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
    name: 'url',
    message: '[>] Input media URL:',
    validate: (val) => val.length !=0 || 'Please input media URL!'
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
    const {username, password, url, perExec, delayTime} = await inquirer.prompt(questions);
    const ig = new instagram(username, password);
    print('Logging in..', 'wait', true);
    const login = await ig.login();
    print(`Logged in as @${login.username} (User ID: ${login.pk})`, 'ok');
    print(`Collecting users in media likers..`, 'wait');
    const id = await ig.getMediaIdByUrl(url);
    let likers = await ig.getMediaLikers(id);
    likers = _.chunk(likers.users, perExec);
    print(`Doing task..\n`, 'wait')
    for(let i=0; i<likers.length; i++) {
      await Promise.all(likers[i].map(async liker => {
        const status = await ig.friendshipStatus(liker.pk);
        if(!liker.is_private && !status.following && !status.followed_by) {
          const media = await ig.userFeed(liker.pk), lastMedia = await media.items();
          const text = fs.readFileSync('./lib/comment-texts.txt', 'utf8').split(/\r\n|\r|\n/);
          const msg = text[Math.floor(Math.random()*text.length)];
          if(lastMedia.length != 0 && lastMedia[0].pk) {
            const task = [ig.follow(liker.pk), ig.like(lastMedia[0].pk), ig.comment(lastMedia[0].pk, msg)];
            let [follow, like, comment] = await Promise.all(task);
            follow = follow ? chalk.bold.green(`Follow`) : chalk.bold.red('Follow');
            like = like ? chalk.bold.green('Like') : chalk.bold.red('Like');
            comment = comment ? chalk.bold.green('Comment') : chalk.bold.red('Comment');
            print(`[+] @${liker.username} => [${follow}, ${like}, ${comment}] | ${chalk.cyanBright(msg)}`)
          }else print(chalk`[-] @${liker.username} => {yellow No posts yet, Skip.}`)
        }else print(chalk`[-] @${liker.username} => {yellow Private or already followed/follows you, Skip.}`)
      }))
      if(i<likers.length-1) print(`Wait for ${delayTime}ms..\n` ,'wait', true); await delay(delayTime)
    }
    print(`Task done!`, 'ok', true)
  }catch(err){
    print(err, 'err')
  }
})()