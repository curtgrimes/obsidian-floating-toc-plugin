import type FloatingToc from "src/main";
import { App, Setting, PluginSettingTab, ButtonComponent } from "obsidian";
import { POSITION_STYLES } from "src/settings/settingsData";
import { selfDestruct } from "src/main";
import { creatToc } from "src/components/floatingtocUI"
import { t } from 'src/translations/helper';
import { FlowList } from './flow-list';


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
      href: "https://pkmer.cn/Pkmer-Docs/10-obsidian/obsidian%E7%A4%BE%E5%8C%BA%E6%8F%92%E4%BB%B6/floating-toc/",
    })
    containerEl.createEl("span", { text: "" }).createEl("a", {
      text: "|English  ",
      href: "https://github.com/cumany/obsidian-floating-toc-plugin/blob/master/README.md",
    });

    let tipsE1 = containerEl.createEl("div");
    tipsE1.addClass('callout');
    tipsE1.setAttribute("data-callout", "info");
    let tips_titleE1 = tipsE1.createEl("div", { text: "🔑TIPS:" })
    tips_titleE1.addClass("callout-title")
    tips_titleE1.createEl("br");
    let tips_contentE1 = tipsE1.createEl("div",{
      text: t("ctrl + click on the floating toc to collapse/expand the header.")
    })
    tips_contentE1.addClass("callout-content");
 
    containerEl.createEl("h2", { text: t("Plugin Settings") });
    let posE1 = new Setting(containerEl)
    posE1.setName(t('Floating TOC position')
    )
    if (this.plugin.settings.positionStyle == "both") {
      posE1.setDesc(
        t("When the panel is split left and right, the right side of the layout is aligned right and the left side of the panel is aligned left.")
      )
    } else if (this.plugin.settings.positionStyle == "right") {
      posE1.setDesc(
        t("Floating TOC position, on the right side of the notes")
      )
    } else
      posE1.setDesc(t('Floating TOC position, default on the left side of the notes'));
    posE1.addDropdown((dropdown) => {
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
    if (this.plugin.settings.positionStyle != "left") {
      new Setting(containerEl)
        .setName(t('Left alignment of TOC text')
        )
        .setDesc(
          t("whether the text in TOC is left aligned")
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
    .setName(t("Default Collapsed Level"))
    .setDesc(t("Set the default collapsed level of headings when initialised"))
    .addDropdown(dropdown => {
      dropdown.addOptions({
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '6': 'None'
      });
      dropdown.setValue(this.plugin.settings.defaultCollapsedLevel.toString())
        .onChange((value) => {
          this.plugin.settings.defaultCollapsedLevel = parseInt(value);
          this.plugin.saveSettings();
          setTimeout(() => {
            dispatchEvent(new Event("refresh-toc"));
          }, 100);
        });
    });

    new Setting(containerEl)
    .setName(t("Expand All Subheadings Recursively"))
    .setDesc(t("When disabled, only direct subheadings will be expanded"))
    .addToggle(toggle => toggle.setValue(this.plugin.settings.expandAllSubheadings)
    .onChange((value) => {
      this.plugin.settings.expandAllSubheadings = value;
      this.plugin.saveSettings();
      setTimeout(() => {
        dispatchEvent(new Event("refresh-toc"));
      }, 100);
    }));
        
    new Setting(containerEl)
      .setName(t('Hide heading level')
      )
      .setDesc(
        t("Whichever option is selected, the corresponding heading level will be hidden")
      )
      let HeadList = new FlowList(containerEl);
      const headerLevel=[1,2,3,4,5,6]
      headerLevel.forEach(async (level) => {   
        let levelsToFilter = this.plugin.settings.ignoreHeaders.split("\n");
        let isChecked = levelsToFilter.includes(level.toString()); //默认忽略第1级
        HeadList.addItem(level.toString(), level.toString(), isChecked, (value) => {
          this.plugin.settings.ignoreHeaders = HeadList.checkedList.join('\n');
          this.plugin.saveSettings();
          setTimeout(() => {
            dispatchEvent(new Event("refresh-toc"));
          }, 100);
        });
      });   
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
    new Setting(containerEl)
      .setName(t('Enable Tooltip')
      )
      .addToggle(toggle => toggle.setValue(this.plugin.settings?.isTooltip)
        .onChange((value) => {
          this.plugin.settings.isTooltip = value;
          this.plugin.saveSettings();
          setTimeout(() => {
            dispatchEvent(new Event("refresh-toc"));
          }, 100);
        }));
    containerEl.createEl("h2", { text: t("Plugin Style Settings") });
    let styleE1 = containerEl.createEl("div");
    styleE1.addClass('callout');
    styleE1.setAttribute("data-callout", "warning");
    let titleE1 = styleE1.createEl("div", { text: "🔔 Notice: Please click the button again,If the floating-toc option is not found in the style settings" })
    titleE1.addClass("callout-title")
    let contentE1 = styleE1.createEl("div")
    contentE1.addClass("callout-content");
    const isEnabled = app.plugins.enabledPlugins.has("obsidian-style-settings");
    if (isEnabled) {
      contentE1.createEl("br");
      let button = new ButtonComponent(contentE1);
      button
        .setIcon("palette")
        .setClass("mod-cta")
        .setButtonText("🎨 Open style settings")
        .onClick(() => {
          app.setting.open();
          app.setting.openTabById("obsidian-style-settings");
          app.workspace.trigger("parse-style-settings");
          setTimeout(() => {
            let floatsettingEI = app.setting.activeTab.containerEl.querySelector(".setting-item-heading[data-id='floating-toc-styles']")
            if (floatsettingEI) { floatsettingEI.addClass?.("float-cta"); }
            else {
              app.workspace.trigger("parse-style-settings");
              app.setting.activeTab.containerEl.querySelector(".setting-item-heading[data-id='floating-toc-styles']")?.addClass?.("float-cta");
            }

          }, 250);
        });
    } else {
      contentE1.createEl("br");
      contentE1.createEl("span", { text: "" }).createEl("a", {
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



