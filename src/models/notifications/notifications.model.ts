import { nanoid } from "nanoid";

export interface NotificationJSON {
  key?: string;
  timestamp?: string;
  title?: string;
  iconName?: string | 'font-awesome'
  owner?: string;
  read?: boolean;
}

export class Notifications implements NotificationJSON {
  key?: string;
  timestamp?: string;
  title?: string;
  iconName?: string;
  owner?: string;
  read?: boolean;

  constructor(params: NotificationJSON) {
    if (!params) {
      this.key = null;
      this.timestamp = null;
      this.title = null;
      this.iconName = null;
      this.owner = null;
      this.read = null;
    } else {
      this.key = params.key || nanoid(8);
      this.timestamp = params.timestamp || String(Date.now())
      this.title = params.title || "-";
      this.iconName = params.iconName || "-";
      this.owner = params.owner || "-";
      this.read = params.read || false;
    }
  }
}
