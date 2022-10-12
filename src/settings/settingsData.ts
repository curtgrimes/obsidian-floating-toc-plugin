

export const POSITION_STYLES = ["left", "right"];


export interface FlotingTOCSetting {
  ignoreTopHeader: boolean;
  positionStyle: string;
  isLoadOnMobile:boolean;
  isLeft:boolean;
}

export const DEFAULT_SETTINGS: FlotingTOCSetting = {
  ignoreTopHeader: false,
  positionStyle: "left",
  isLoadOnMobile: true,
  isLeft: false
};
