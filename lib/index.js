/**
 * Import modules
 */
const {IgApiClient} = require('instagram-private-api');
const rp = require('request-promise');
const chalk = require('chalk');
const inquirer = require('inquirer');
const _ = require('lodash');
const fs = require('fs');

const ig = new IgApiClient;

class instagram {
  /**
   * Constructor
   * @param  {string} username - instagram username
   * @param  {string} password - instagram password
   */
  constructor(username, password) {
    this.username = username;
    this.password = password
  }

  /**
   * Auth login
   * @return {Promise}
   */
  async login() {
    ig.state.generateDevice(this.username);
    try{
      const login = await ig.account.login(this.username, this.password);
      return Promise.resolve(login)
    }catch(err){
      if(err.message.match(/challenge_required/i)) {
        console.log(chalk`{yellow [!] Challenge required!}`);
        try{
          await ig.challenge.auto(true);
          const {code} = await inquirer.prompt({
            type: 'input', 
            name: 'code', 
            message: '[>] Input verification code (check it in email or sms):',
            validate: (val) => (/[0-9]/.test(val)) || 'Only input numbers'
          });
          const verify = await ig.challenge.sendSecurityCode(code);
          return Promise.resolve(verify.logged_in_user)
        }catch(chErr) {
          return Promise.reject(chErr.message)
        }
      }else return Promise.reject(err.message)
    }
  }

  /**
   * Get ID by Username
   * @param  {string} username - Instagram username
   * @return {Promise}
   */
  async getIdByUsername(username) {
    try{
      const id = await ig.user.getIdByUsername(username);
      return Promise.resolve(id)
    }catch(err){
      return Promise.reject(err)
    }
  }
  
  /**
   * Get user info
   * @param  {number} uid - User ID
   * @return {Promise}
   */
  async userInfo(uid) {
    try{
      const info = await ig.user.info(uid);
      return Promise.resolve(info)
    }catch(err){
      return Promise.reject(err.message)
    }
  }

  /**
   * Get media info
   * @param  {number} mid - Media ID
   * @return {Promise}
   */
  async mediaInfo(mid) {
    try{
      const info = await ig.media.info(mid);
      return Promise.resolve(info)
    }catch(err){
      return Promise.reject(err.message)
    }
  }

  /**
   * Show friendship status
   * @param  {number} uid - User ID
   * @return {Promise}
   */
  async friendshipStatus(uid) {
    try{
      const status = ig.friendship.show(uid);
      return Promise.resolve(status)
    }catch(err){
      return Promise.reject(err.message)
    }
  }

  /**
   * Get user feed
   * @param  {number} uid - User ID
   * @return {Promise}
   */
  async userFeed(uid) {
    try{
      const feed = await ig.feed.user(uid);
      return Promise.resolve(feed)
    }catch(err){
      return Promise.reject(err.message)
    }
  }

  /**
   * Get timeline feed
   * @return {Promise}
   */
  async timelineFeed() {
    try{
      const feed = await ig.feed.timeline();
      return Promise.resolve(feed)
    }catch(err){
      return Promise.reject(err.message)
    }
  }

  /**
   * Get user story reels
   * @param  {number} uid - User ID
   * @return {Promise}
   */
  async userReels(uid) {
    try{
      const reels = await ig.feed.reelsMedia({userIds: [uid]});
      return Promise.resolve(reels)
    }catch(err){
      return Promise.reject(err.message)
    }
  }

  /**
   * Get timeline reels
   * @return {Promise}
   */
  async timelineReels() {
    try{
      const reels = await ig.feed.reelsTray();
      return Promise.resolve(reels)
    }catch(err){
      return Promise.reject(err.message)
    }
  }

  /**
   * Get location media feed
   * @param  {number} lid - Location ID
   * @return {Promise}
   */
  async locationFeed(lid) {
    try{
      const feed = await ig.feed.location(lid);
      return Promise.resolve(feed)
    }catch(err){
      return Promise.reject(err.message)
    }
  }

  /**
   * Get tagged media feed
   * @param  {string} hashtag - Hashtag
   * @return {Promise}
   */
  async tagFeed(hashtag) {
    try{
      const feed = await ig.feed.tag(hashtag);
      return Promise.resolve(feed)
    }catch(err){
      return Promise.reject(err.message)
    }
  }

  /**
   * Get user followers
   * @param  {number} uid - User ID
   * @return {Promise}
   */
  async followersFeed(uid) {
    try{
      const followers = await ig.feed.accountFollowers(uid);
      return Promise.resolve(followers)
    }catch(err){
      return Promise.reject(err.message)
    }
  }

  /**
   * Get user following
   * @param  {number} uid - User ID
   * @return {Promise}
   */
  async followingFeed(uid) {
    try{
      const following = await ig.feed.accountFollowing(uid);
      return Promise.resolve(following)
    }catch(err){
      return Promise.reject(err.message)
    }
  }

  /**
   * Get media ID by URL
   * @param  {string} url - Media URL
   * @return {Promise}
   */
  async getMediaIdByUrl(url) {
    try{
      const get = await rp({url: `http://api.instagram.com/oembed?url=${url}`, method: 'GET', json: true});
      const id = get.media_id.split('_')[0] || '';
      return Promise.resolve(id)
    }catch(err){
      return Promise.reject(err.message)
    }
  }

  /**
   * Get media likers
   * @param  {number} mid - Media ID
   * @return {Promise}
   */
  async getMediaLikers(mid) {
    try{
      const get = await ig.media.likers(mid);
      return Promise.resolve(get)
    }catch(err){
      return Promise.reject(err.message)
    }
  }

  /**
   * Follow user by User ID
   * @param  {number} uid - User ID
   * @return {boolean}
   */
  async follow(uid) {
    try{
      await ig.friendship.create(uid);
      return true
    }catch(err){
      return false
    }
  }

  /**
   * Unfollow user by User ID
   * @param  {number} uid - User ID
   * @return {boolean}
   */
  async unfollow(uid) {
    try{
      await ig.friendship.destroy(uid);
      return true
    }catch(err){
      return false
    }
  }

  /**
   * Like media
   * @param  {number} mid - Media ID
   * @return {boolean}
   */
  async like(mid) {
    try{
      await ig.media.like({mediaId: mid, moduleInfo: {module_name: 'profile'}});
      return true
    }catch(err){
      return false
    }
  }

  /**
   * Unlike media
   * @param  {number} mid - Media ID
   * @return {boolean}
   */
  async unlike(mid) {
    try{
      await ig.media.unlike({mediaId: mid, moduleInfo: {module_name: 'profile'}});
      return true
    }catch(err){
      return false
    }
  }

  /**
   * Comment media
   * @param  {number} mid - Media ID
   * @param  {string} msg - Message text
   * @return {boolean}
   */
  async comment(mid, msg) {
    try{
      await ig.media.comment({mediaId: mid, text: msg});
      return true
    }catch(err){
      return false
    }
  }

  /**
   * Delete media
   * @param  {number} mid - Media ID
   * @param  {string} type - Media type (Photo/Video/Carousel)
   * @return {Promise}
   */
  async deleteMedia(mid, type) {
    try{
      const del = await ig.media.delete({mediaId: mid, mediaType: type.toUpperCase()});
      const isOk = del.did_delete ? true : false;
      return Promise.resolve(isOk)
    }catch(err){
      return Promise.reject(err.message)
    }
  }

  /**
   * Mark story as seen
   * @param  {object} item - Story item
   * @return {boolean}
   */
  async markStorySeen(item) {
    try{
      await ig.story.seen([item]);
      return true
    }catch(err){
      return false
    }
  }

  /**
   * Send direct message
   * @param  {number} tid - Target ID
   * @param  {string} msg - Message text
   * @return {boolean}
   */
  async sendDirectMessage(tid, msg) {
    try{
      const thread = ig.entity.directThread([tid.toString()]);
      await thread.broadcastText(msg);
      return true
    }catch(err){
      return false
    }
  }
}

/**
 * Print
 * @param  {string} msg - Message
 * @param  {string} type
 */
const print = (msg, type, line) => {
  !type && console.log(msg)
  type == 'ok' && console.log(chalk`{green ${line ? "\n" : ""}[#] ${msg}}`)
  type == 'wait' && console.log(chalk`{bold.cyan ${line ? "\n" : ""}[*] ${msg}}`)
  type == 'warn' && console.log(chalk`{yellow ${line ? "\n" : ""}[!] ${msg}}`)
  type == 'err' && console.log(chalk`{red ${line ? "\n" : ""}[-] ${msg}}`)
}

/**
 * Delay
 * @param  {number} ms - Delay time
 * @return {Promise}
 */
const delay = async ms => new Promise((resolve => setTimeout(resolve, ms)));

/**
 * export modules
 */
module.exports = {chalk, inquirer, _, fs, instagram, print, delay}