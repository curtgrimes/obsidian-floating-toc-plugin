import type FloatingToc from "src/main";
import { App, Setting, PluginSettingTab, ButtonComponent } from "obsidian";
import { POSITION_STYLES } from "src/settings/settingsData";
import { selfDestruct } from "src/main";
import { creatToc } from "src/components/floatingtocUI"
import { t } from 'src/translations/helper';



export class FlotingTOCSettingTab extends PluginSettingTab {
  plugin: FloatingToc;
  appendMethod: string;

  constructor(app: App, plugin: FloatingToc) {
    super(app, plugin);
    this.plugin = plugin;
    addEventListener("refresh-toc", () => {
      selfDestruct();
      creatToc(app, this.plugin);
    });
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h1", { text: "Obsidian Floating TOC " });
    containerEl.createEl("span", { text: "" }).createEl("a", {
      text: "Author: Cuman ✨",
      href: "https://github.com/cumany",
    })
    containerEl.createEl("span", { text: "" }).createEl("a", {
      text: "Readme:中文",
      href: "https://github.com/cumany/obsidian-floating-toc-plugin/blob/master/README-zh_cn.md",
    })
    containerEl.createEl("span", { text: "" }).createEl("a", {
      text: "|English  ",
      href: "https://github.com/cumany/obsidian-floating-toc-plugin/blob/master/README.md",
    });
    containerEl.createEl("p", { text: "🔑TIPS: " })
      .createEl("p", {
        text: "ctrl + click on the floating toc to collapse/expand the header."
      });
    containerEl.createEl("h2", { text: t("Plugin Settings") });
    new Setting(containerEl)
      .setName(t('Floating TOC position')
      )
      .setDesc(t('Floating TOC position, default on the left side of the notes')
      )
      .addDropdown((dropdown) => {
        let posotions: Record<string, string> = {};
        POSITION_STYLES.map((posotion: string) => (posotions[posotion] = posotion));
        dropdown.addOptions(posotions);
        dropdown
          .setValue(this.plugin.settings.positionStyle)
          .onChange((positionStyle: string) => {
            this.plugin.settings.positionStyle = positionStyle;
            this.plugin.saveSettings();
            setTimeout(() => {
              this.display();
              dispatchEvent(new Event("refresh-toc"));
            }, 100);
          });
      });
    if (this.plugin.settings.positionStyle == "right") {
      new Setting(containerEl)
        .setName(t('Left Aligned')
        )
        .setDesc(
          t("whether it is left or right aligned When the floating toc is on the right")
        )
        .addToggle(toggle => toggle.setValue(this.plugin.settings?.isLeft)
          .onChange((value) => {
            this.plugin.settings.isLeft = value;
            this.plugin.saveSettings();
            setTimeout(() => {
              this.display();
              dispatchEvent(new Event("refresh-toc"));
            }, 100);
          }));
    }
    new Setting(containerEl)
      .setName(t('Mobile enabled or not')
      )
      .setDesc(
        t("Whether to enable the plugin for the mobile client, the default is enabled.")
      )
      .addToggle(toggle => toggle.setValue(this.plugin.settings?.isLoadOnMobile)
        .onChange((value) => {
          this.plugin.settings.isLoadOnMobile = value;
          this.plugin.saveSettings();
          setTimeout(() => {
            dispatchEvent(new Event("refresh-toc"));
          }, 100);
        }));
    new Setting(containerEl)
      .setName(t('Ignore top-level headers')
      )
      .setDesc(
        t("Select whether to ignore the top-level headings. When turned on, the top-level headings in the current note are not displayed in the floating TOC.")
      )
      .addToggle(toggle => toggle.setValue(this.plugin.settings?.ignoreTopHeader)
        .onChange((value) => {
          this.plugin.settings.ignoreTopHeader = value;
          this.plugin.saveSettings();
          setTimeout(() => {
            dispatchEvent(new Event("refresh-toc"));
          }, 100);
        }));
    new Setting(containerEl)
      .setName(t('Default Pin')
      )
      .addToggle(toggle => toggle.setValue(this.plugin.settings?.isDefaultPin)
        .onChange((value) => {
          this.plugin.settings.isDefaultPin = value;
          this.plugin.saveSettings();
          setTimeout(() => {
            dispatchEvent(new Event("refresh-toc"));
          }, 100);
        }));
    containerEl.createEl("h2", { text: t("Plugin Style Settings") });

    const isEnabled = app.plugins.enabledPlugins.has("obsidian-style-settings");
    if (isEnabled) {

      containerEl.createEl("p", { text: "🔔Notice: " })
        .createEl("p", {
          text: t("If the floating Toc option is not found in the style setting, please reload the style setting plugin (turn it off and on again)")
        });
      let button = new ButtonComponent(containerEl);
      button
        .setIcon("palette")
        .setClass("tiny")
        .setButtonText("🎨 Open style settings")
        .onClick(() => {
          app.setting.open();
          setTimeout(() => app.setting.openTabById("obsidian-style-settings"), 300);
        });
    } else {
      containerEl.createEl("span", { text: "" }).createEl("a", {
        text: "Please install or enable the style-settings plugin",
        href: "obsidian://show-plugin?id=obsidian-style-settings",
      })
    }


    const cDonationDiv = containerEl.createEl("div", {
      cls: "cDonationSection",
    });

    const credit = createEl("p");
    const donateText = createEl("p");
    donateText.appendText(
      "If you like this Plugin and are considering donating to support continued development, use the button below!"
    );
    credit.setAttribute("style", "color: var(--text-muted)");
    cDonationDiv.appendChild(donateText);
    cDonationDiv.appendChild(credit);

    cDonationDiv.appendChild(
      createDonateButton("https://github.com/cumany#thank-you-very-much-for-your-support")
    );
  }
}

const createDonateButton = (link: string): HTMLElement => {
  const a = createEl("a");
  a.setAttribute("href", link);
  a.addClass("buymeacoffee-img");
  a.innerHTML = `<img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee &emoji=&slug=Cuman&button_colour=BD5FFF&font_colour=ffffff&font_family=Poppins&outline_colour=000000&coffee_colour=FFDD00" />`;
  return a;
};



