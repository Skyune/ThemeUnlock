/**
 * @name ThemeUnlock
 * @version 0.0.1
 * @description Unlocks themes, adds flowers decoration to your profile, all client side (early version, will need to update so save changes after restart).
 * @author Skyune
 */
module.exports = class ThemeUnlock {
  constructor() {
    // Do stuff in here before starting
  }

 

  start() {
    // Access the webpack modules
    window.webpackChunkdiscord_app.push([[Math.random()], {}, (wpRequire) => {
        // Constants used to access webpack functions
        const webpackValues = Object.values(wpRequire.c);
        const usermod = webpackValues.find((x) => x?.exports?.default?.getUsers);     
        // Original getCurrentUser function
        const oldUser = usermod.exports.default.__proto__.getCurrentUser;

        // Set currentUser to follow configured settings
        usermod.exports.default.__proto__.getCurrentUser = () => {
            const userData = oldUser();
            const newUserData = {
                ...userData,
                premiumType: 2,
                avatarDecoration: 'v2_a_9c70ff0db80d85ee6d9690a0eeded0c8',
                __proto__: userData.__proto__
            };
            return newUserData;
        };
        
        // Block the API call that checks themes
        //Also it just crashes but lmao
        const oldXhrOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
          if (url === "https://discord.com/api/v9/users/@me/settings-proto/1") {
            console.log("Blocked malicious API call.");
            return;
          }
          oldXhrOpen.apply(this, arguments);
        };
    }]);


    //todo:
    //save theme locally so it works after restarting.
  }

  stop() {
    // Cleanup when disabled
  }
};
