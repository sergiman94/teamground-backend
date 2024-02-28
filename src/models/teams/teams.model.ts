import { nanoid } from "nanoid";
import { UserJSON } from "../users/users.model";

export interface TeamJSON {
  key?: string;
  name?: string;
  image?: string;
  description?: string;
  location?: string;
  address?: string;
  coach?: string; // id of the user who's the coach
  rating?: string;
  trainings?: Array<String>;
  media?: Array<String>;
  members?: Array<String>;
  lat?: string;
  lng?: string;
}

export class Teams implements TeamJSON {
  key?: string;
  name?: string;
  image?: string;
  description?: string;
  location?: string;
  address?: string;
  coach?: string; // id of the user who's the coach
  rating?: string;
  trainings?: Array<String>;
  media?: Array<String>;
  members?: Array<String>;
  lat?: string;
  lng?: string;

  constructor(params?: TeamJSON) {
    if (!params) {
      this.key = null;
      this.name = null;
      this.image = null;
      this.description = null;
      this.location = null;
      this.address = null;
      this.coach = null;
      this.rating = null;
      this.trainings = null;
      this.media = null;
      this.members = null;
      this.lat = null;
      this.lng = null;
    } else {
      this.key = params.key || nanoid(8);
      this.name = params.name || " - ";
      this.image =
        params.image ||
        "https://agcnwo.com/wp-content/uploads/2020/09/avatar-placeholder.png";
      this.description = params.description || "";
      this.location = params.location || " - ";
      this.address = params.address || " - ";
      this.coach = params.coach || " - ";
      this.rating = params.rating || " - ";
      this.trainings = params.trainings || [];
      this.media = params.media || [];
      this.members = params.members || [];
      this.lat = params.lat || " - ";
      this.lng = params.lng || " - ";
    }
  }
}
