/**
 * @name ThemeUnlock
 * @version 0.0.2
 * @description Unlocks nitro themes, all client side.
 * @author Skyune
 */

module.exports = (() => {
  const config = {
    "info": {
      "name": "ThemeUnlock",
      "authors": [{
        "name": "Skyune"
      }],
      "version": "0.0.2",
      "description": "Unlock themes tab."
    },
    "main": "ThemeUnlock.plugin.js"
  };

  return !global.ZeresPluginLibrary ? class {
    constructor() {
      this._config = config;
    }
    getName() {
      return config.info.name;
    }
    getAuthor() {
      return config.info.authors.map(a => a.name).join(", ");
    }
    getDescription() {
      return config.info.description;
    }
    getVersion() {
      return config.info.version;
    }
    load() {
      BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
        confirmText: "Download Now",
        cancelText: "Cancel",
        onConfirm: () => {
          require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
            if (error) return require("electron").shell.openExternal("https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
            await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
          });
        }
      });
    }
    start() {
      // todo:
      // save theme locally so it works after restarting.

      const themesModule = ZLibrary.WebpackModules.getByProps("V1", "ZI");
      const gradientSettingModule = ZLibrary.WebpackModules.getByProps("Bf", "X9", "zO");

      BdApi.Patcher.before("YABDP4Nitro", themesModule, "ZI", (_, args) => {

        if (args[0].backgroundGradientPresetId != undefined) { //If appearance is changed to a nitro client theme
          this.settings.lastGradientSettingStore = parseInt(args[0].backgroundGradientPresetId); //Store the gradient value
          this.saveSettings(); //Save the gradient value to file
        }
        if (args[0].backgroundGradientPresetId == undefined) { //If appearance is changed to a non-nitro client theme
          this.settings.lastGradientSettingStore = -1; //Set the gradient value to -1 (disabled)
          this.saveSettings(); //Save that value to file
        }

        themesModule.ZP.updateTheme(args[0].theme); //Change from light to dark theme. It was having issues due to shouldSync being false so we just set it manually if the user changes the Appearance

        if (this.settings.lastGradientSettingStore != -1) { //If appearance is changed to a nitro client theme
          gradientSettingModule.zO(this.settings.lastGradientSettingStore); //Apply nitro client theme
        }
        //console.log(this.settings.lastGradientSettingStore);
      });

      if (this.settings.lastGradientSettingStore != -1) { //If appearance is changed to a nitro client theme
        gradientSettingModule.zO(this.settings.lastGradientSettingStore); //Restore gradient on plugin load/save if it is set
      }
    }
  } : (([Plugin, Api]) => {
    const plugin = (Plugin, Api) => {
      const { Patcher, Utilities } = Api;
      return class ThemeUnlock extends Plugin {
        defaultSettings = {
          "clientThemes": true,
          "lastGradientSettingStore": -1
        };
        settings = this.defaultSettings;

        load() {
          if (typeof window.ZeresPluginLibrary === "undefined") {
            BdApi.showConfirmationModal(
              "Library Missing",
              `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`,
              {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                  require("request").get(
                    "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
                    async (error, response, body) => {
                      if (error)
                        return require("electron").shell.openExternal(
                          "https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js"
                        );
                      await new Promise((r) =>
                        require("fs").writeFile(
                          require("path").join(
                            BdApi.Plugins.folder,
                            "0PluginLibrary.plugin.js"
                          ),
                          body,
                          r
                        )
                      );
                      BdApi.showToast(
                        "Library installed. Please restart the plugin.",
                        { type: "success" }
                      );
                    }
                  );
                }
              }
            );
          }
        }

        saveSettings() {
          this.settings.lastGradientSettingStore = parseInt(
            this.settings.lastGradientSettingStore
          );
          Utilities.saveSettings(this.getName(), this.settings);
        }

        onStart() {
          window.webpackChunkdiscord_app.push([
            [Math.random()],
            {},
            (wpRequire) => {
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
              // Also it just crashes but lmao
              const oldXhrOpen = XMLHttpRequest.prototype.open;
              XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
                if (url === "https://discord.com/api/v9/users/@me/settings-proto/1") {
                  console.log("Blocked malicious API call.");
                  return;
                }
                oldXhrOpen.apply(this, arguments);
              };
            }
          ]);
          const themesModule = ZLibrary.WebpackModules.getByProps("V1", "ZI");
          const gradientSettingModule = ZLibrary.WebpackModules.getByProps(
            "Bf",
            "X9",
            "zO"
          );

          Patcher.before(
            themesModule,
            "ZI",
            (_, args) => {
              if (args[0].backgroundGradientPresetId != undefined) {
                //If appearance is changed to a nitro client theme
                this.settings.lastGradientSettingStore = parseInt(
                  args[0].backgroundGradientPresetId
                ); //Store the gradient value
                this.saveSettings(); //Save the gradient value to file
              }
              if (args[0].backgroundGradientPresetId == undefined) {
                //If appearance is changed to a non-nitro client theme
                this.settings.lastGradientSettingStore = -1; //Set the gradient value to -1 (disabled)
                this.saveSettings(); //Save that value to file
              }

              themesModule.ZP.updateTheme(args[0].theme); //Change from light to dark theme. It was having issues due to shouldSync being false so we just set it manually if the user changes the Appearance

              if (this.settings.lastGradientSettingStore != -1) {
                //If appearance is changed to a nitro client theme
                gradientSettingModule.zO(this.settings.lastGradientSettingStore); //Apply nitro client theme
              }
              //console.log(this.settings.lastGradientSettingStore);
            },
            true
          );

          if (this.settings.lastGradientSettingStore != -1) {
            //If appearance is changed to a nitro client theme
            gradientSettingModule.zO(this.settings.lastGradientSettingStore); //Restore gradient on plugin load/save if it is set
          }
        }

        onStop() {
          Patcher.unpatchAll();
        }
      };
    };
    return plugin(Plugin, Api);
  })(global.ZeresPluginLibrary.buildPlugin(config));
})();
