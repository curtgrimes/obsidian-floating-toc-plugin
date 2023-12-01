

export const POSITION_STYLES = ["left", "right","both"];


export interface FlotingTOCSetting {
  ignoreHeaders:string;
  ignoreTopHeader: boolean;
  positionStyle: string;
  isLoadOnMobile:boolean;
  isLeft:boolean;
  isDefaultPin:boolean;
  isTooltip:boolean;
  defaultCollapsedLevel:number;
  expandAllSubheadings: boolean;
}

export const DEFAULT_SETTINGS: FlotingTOCSetting = {
  ignoreHeaders:'',
  ignoreTopHeader: false,
  positionStyle: "left",
  isLoadOnMobile: true,
  isLeft: false,
  isDefaultPin: false,
  isTooltip: false,
  defaultCollapsedLevel: 6,
  expandAllSubheadings: false,
};
