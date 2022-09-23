

export const POSITION_STYLES = ["left", "right"];


export interface FlotingTOCSetting {
  ignoreTopHeader: boolean;
  positionStyle: string;

}

export const DEFAULT_SETTINGS: FlotingTOCSetting = {
  ignoreTopHeader: false,
  positionStyle: "left"
};
