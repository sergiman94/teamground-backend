import { nanoid } from "nanoid";

export interface TrainingJSON {
  key?: string;
  team?: string;
  players?: Array<String>;
  active?: boolean;
  date?: string;
  hour?: string;
  coach?: string;
  timestamp?: string;
  status?: string;
  field?: string;
  location?: string;
  confirmed?: boolean;
  confirmedAction?: boolean
}

export class Trainings implements TrainingJSON {
  key?: string;
  team?: string;
  players?: Array<String>;
  active?: boolean;
  date?: string;
  hour?: string;
  coach?: string;
  timestamp?: string;
  status?: string;
  field?: string;
  location?: string;
  confirmed?: boolean;
  confirmedAction?: boolean

  constructor(params: TrainingJSON) {
    if (!params) {
      this.key = null;
      this.team = null;
      this.players = null;
      this.active = null;
      this.date = null;
      this.hour = null;
      this.coach = null;
      this.timestamp = null;
      this.status = null;
      this.field = null;
      this.location = null;
      this.confirmed = null;
      this.confirmedAction = null
    } else {
      this.key = params.key || nanoid(8);
      this.team = params.team || "-";
      this.players = params.players || [];
      this.active = params.active || true;
      this.date = params.date || " - ";
      this.hour = params.hour || " - ";
      this.coach = params.coach || " - ";
      this.timestamp = params.timestamp || Date.now().toString();
      this.status = params.status || "active";
      this.field = params.field || null;
      this.location = params.location || null;
      this.confirmed = params.confirmed || params.field ? false : true;
      this.confirmedAction = params.confirmedAction || false
    }
  }
}
