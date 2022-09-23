import type FloatingToc from "src/main";
import { App, Setting, PluginSettingTab } from "obsidian";
import { POSITION_STYLES } from "src/settings/settingsData";
import { selfDestruct } from "src/main";
import { CreatToc } from "src/components/floatingtocUI"
import { t } from 'src/translations/helper';



export class FlotingTOCSettingTab extends PluginSettingTab {
  plugin: FloatingToc;
  appendMethod: string;     

  constructor(app: App, plugin: FloatingToc) {
    super(app, plugin);
    this.plugin = plugin;
    addEventListener(" -toc", () => {
      selfDestruct();
      CreatToc(app, this.plugin);
    });
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h1", { text: "Obsidian Floating TOC " });
    containerEl.createEl("span", { text: "From: " }).createEl("a", {
      text: "Cuman ✨",
      href: "https://github.com/cumany",
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
              dispatchEvent(new Event("refresh-toc"));
            }, 100);
          });
      });
   
/*     new Setting(containerEl)
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
  })); */

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
 


