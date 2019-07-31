const {chalk, inquirer, print} = require('./lib/index.js');

/**
 * Coded by Rifqi Haidar
 * Special thanks to CCOCOT (original author), I Putu Jaya Adi Pranata, and SGB TEAM
 */

const menuList = [
  chalk.blue('Like All Media on Timeline'),
  chalk.blue('Like All Media of Targeted User'),
  new inquirer.Separator(),
  chalk.green('Follow Followers of Targeted User (+Like and Comment)'),
  chalk.green('Follow Followers of Targeted User (+Like and Comment) v2'),
  chalk.green('Follow Followers of Targeted User (+Like and DM)'),
  chalk.green('Follow User by Location (+Like and Comment)'),
  chalk.green('Follow User by Hashtag (+Like and Comment)'),
  chalk.green('Follow User from Media Likers (+Like and Comment)'),
  new inquirer.Separator(),
  chalk.red('Unfollow All Followed Users'),
  chalk.red('Unfollow who Not Follow Back'),
  chalk.red('Delete All Media'),
  chalk.bold.red('\n [>] Please choose one! \n')
];

const menuQuestion = {
  type: 'list',
  name: 'choice',
  message: '[>] Select menu:',
  choices: menuList
};

(async() => {
  print(chalk`{blue \t\tInstagram Tools}\n\t{magenta Rifqi Haidar - CCOCOT - SGB TEAM}\n`)
  try{
    const {choice} = await inquirer.prompt(menuQuestion);
    choice == menuList[0] && require('./lib/liketimeline.js');
    choice == menuList[1] && require('./lib/liketarget.js');
    choice == menuList[3] && require('./lib/fftu.js');
    choice == menuList[4] && require('./lib/fftuv2.js');
    choice == menuList[5] && require('./lib/fftudm.js');
    choice == menuList[6] && require('./lib/followbylocation.js');
    choice == menuList[7] && require('./lib/followbyhashtag.js');
    choice == menuList[8] && require('./lib/followfrommedialikers.js');
    choice == menuList[10] && require('./lib/unfollowall.js');
    choice == menuList[11] && require('./lib/unfollnotfollback.js');
    choice == menuList[12] && require('./lib/delallmedia.js');
    choice == menuList[13] && process.exit()
  }catch(err){
    print(err, 'err')
  }
})()